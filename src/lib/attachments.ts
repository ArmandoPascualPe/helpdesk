import { pb, getPb } from './pocketbase';

export interface TicketAttachment {
  id: string;
  ticket: string;
  archivos: string[];
  created: string;
}

export const ALLOWED_TYPES = ['png', 'jpeg', 'jpg', 'pdf', 'zip'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_TICKET = 3;

export function validateAttachment(file: File): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !ALLOWED_TYPES.includes(extension)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Solo: ${ALLOWED_TYPES.join(', ')}`,
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de 5MB`,
    };
  }
  
  return { valid: true };
}

export function validateFileCount(currentCount: number): { valid: boolean; error?: string } {
  if (currentCount >= MAX_FILES_PER_TICKET) {
    return {
      valid: false,
      error: `Máximo ${MAX_FILES_PER_TICKET} archivos permitidos por ticket`,
    };
  }
  return { valid: true };
}

export async function getAttachmentsByTicket(ticketId: string): Promise<TicketAttachment | null> {
  const pb = getPb();
  
  try {
    const ticket = await pb.collection('tickets').getOne<TicketAttachment>(ticketId);
    return ticket;
  } catch (e) {
    return null;
  }
}

export function getFileUrl(ticketId: string, filename: string): string {
  const pb = getPb();
  return pb.files.getUrl({ collectionId: 'tickets', id: ticketId }, filename, {
    expires: 3600,
  });
}