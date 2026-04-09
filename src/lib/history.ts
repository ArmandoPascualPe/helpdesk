import { pb } from './pocketbase';

export type ChangeType = 'STATE_CHANGE' | 'ASSIGNMENT_CHANGE' | 'PRIORITY_CHANGE';

export interface HistoryEntry {
  id: string;
  ticket_id: string;
  user_id: string;
  change_type: ChangeType;
  old_value: string;
  new_value: string;
  created: string;
}

/**
 * Get history entries for a ticket.
 * Returns sorted by created desc (most recent first).
 */
export async function getHistoryByTicket(ticketId: string): Promise<HistoryEntry[]> {
  const records = await pb.collection('historial').getList<HistoryEntry>(1, 100, {
    filter: `ticket_id = "${ticketId}"`,
    sort: '-created',
  });
  
  return records.items;
}

/**
 * Record a history entry.
 */
export async function recordHistory(data: {
  ticket_id: string;
  change_type: ChangeType;
  old_value?: string;
  new_value?: string;
}): Promise<HistoryEntry> {
  const user = pb.authStore.model as any;
  
  const entry = await pb.collection('historial').create<HistoryEntry>({
    ticket_id: data.ticket_id,
    user_id: user?.id,
    change_type: data.change_type,
    old_value: data.old_value || '',
    new_value: data.new_value || '',
  });
  
  return entry;
}