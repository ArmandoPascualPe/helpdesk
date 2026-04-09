import { pb } from './pocketbase';
import { z } from 'zod';

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  filename: string;
  file_size: number;
  content_type: string;
  created: string;
}

export const ALLOWED_TYPES = ['png', 'jpeg', 'pdf', 'zip'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_TICKET = 3;

/**
 * Validate attachment file.
 * Checks type and size constraints (D-05, D-06, D-07).
 */
export function validateAttachment(file: File): { valid: boolean; error?: string } {
  // Get file extension
  const filename = file.name.toLowerCase();
  const ext = filename.split('.').pop() || '';
  
  // Check file type
  if (!ALLOWED_TYPES.includes(ext)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${ALLOWED_TYPES.join(', ')}`,
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de 5MB`,
    };
  }
  
  return { valid: true };
}

/**
 * Get total attachments count for a ticket.
 */
export async function getAttachmentCount(ticketId: string): Promise<number> {
  const result = await pb.collection('tickets').getOne(ticketId, {
    fields: 'adjuntos',
  });
  
  const adjuntos = result.adjuntos as string[] | null;
  return adjuntos?.length || 0;
}

/**
 * Get attachments for a ticket.
 * Returns the adjuntos array from the ticket record.
 */
export async function getAttachmentsByTicket(ticketId: string): Promise<string[]> {
  try {
    const result = await pb.collection('tickets').getOne(ticketId, {
      fields: 'adjuntos',
    });
    
    const adjuntos = result.adjuntos as string[] | null;
    return adjuntos || [];
  } catch {
    return [];
  }
}