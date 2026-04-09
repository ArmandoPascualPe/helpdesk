'use server';

import { currentUser } from '@/lib/auth';
import { recordHistory, ChangeType, HistoryEntry } from '@/lib/history';
import { pb } from '@/lib/pocketbase';
import { z } from 'zod';

const recordHistorySchema = z.object({
  ticket_id: z.string().min(1, 'Ticket ID requerido'),
  change_type: z.enum(['STATE_CHANGE', 'ASSIGNMENT_CHANGE', 'PRIORITY_CHANGE']),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
});

type RecordHistoryInput = z.infer<typeof recordHistorySchema>;

/**
 * Server Action to record ticket history.
 * Automatically gets current user for user_id.
 */
export async function recordTicketHistory(
  data: RecordHistoryInput
): Promise<{ success: boolean; entry?: HistoryEntry; error?: string }> {
  try {
    // Validate input
    const validated = recordHistorySchema.parse(data);
    
    // Get current user
    const user = currentUser();
    if (!user) {
      return { success: false, error: 'Debe iniciar sesión' };
    }
    
    // Only record if value changed (prevent duplicates per D-16)
    if (validated.old_value === validated.new_value) {
      return { success: true, entry: undefined }; // No change, no record
    }
    
    // Record the history entry
    const entry = await recordHistory({
      ticket_id: validated.ticket_id,
      change_type: validated.change_type as ChangeType,
      old_value: validated.old_value,
      new_value: validated.new_value,
    });
    
    return { success: true, entry };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Error recording history:', error);
    return { success: false, error: 'Error al registrar historial' };
  }
}

/**
 * Helper to check if state changed and record history.
 */
export async function recordStateChange(
  ticketId: string,
  oldState: string,
  newState: string
): Promise<{ success: boolean; error?: string }> {
  if (oldState === newState) {
    return { success: true };
  }
  
  return recordTicketHistory({
    ticket_id: ticketId,
    change_type: 'STATE_CHANGE',
    old_value: oldState,
    new_value: newState,
  });
}

/**
 * Helper to check if assignment changed and record history.
 */
export async function recordAssignmentChange(
  ticketId: string,
  oldAssignment: string | null,
  newAssignment: string | null
): Promise<{ success: boolean; error?: string }> {
  const oldVal = oldAssignment || '';
  const newVal = newAssignment || '';
  
  if (oldVal === newVal) {
    return { success: true };
  }
  
  return recordTicketHistory({
    ticket_id: ticketId,
    change_type: 'ASSIGNMENT_CHANGE',
    old_value: oldVal,
    new_value: newVal,
  });
}

/**
 * Helper to check if priority changed and record history.
 */
export async function recordPriorityChange(
  ticketId: string,
  oldPriority: string,
  newPriority: string
): Promise<{ success: boolean; error?: string }> {
  if (oldPriority === newPriority) {
    return { success: true };
  }
  
  return recordTicketHistory({
    ticket_id: ticketId,
    change_type: 'PRIORITY_CHANGE',
    old_value: oldPriority,
    new_value: newPriority,
  });
}