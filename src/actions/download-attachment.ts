'use server';

import { pb } from '@/lib/pocketbase';
import { currentUser } from '@/lib/auth';

/**
 * Get the URL for downloading an attachment.
 * Requires authentication check (D-09).
 */
export async function getDownloadUrl(
  ticketId: string,
  filename: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Check authentication
    const user = currentUser();
    if (!user) {
      return { success: false, error: 'Debe iniciar sesión para descargar' };
    }
    
    // Get ticket to verify it exists and user has access
    const ticket = await pb.collection('tickets').getOne(ticketId);
    
    if (!ticket) {
      return { success: false, error: 'Ticket no encontrado' };
    }
    
    // Verify user has access to this ticket
    // Cliente can only download from their own tickets
    if (user.rol === 'cliente' && ticket.user_id !== user.id) {
      return { success: false, error: 'No tiene acceso a este ticket' };
    }
    
    // Get the file URL from PocketBase
    const fileUrl = pb.files.getUrl(ticket, filename);
    
    return { success: true, url: fileUrl };
  } catch (error) {
    console.error('Error getting download URL:', error);
    return { success: false, error: 'Error al obtener URL de descarga' };
  }
}

/**
 * Generate download information for a ticket's attachments.
 */
export async function getAttachmentDownloadInfo(
  ticketId: string
): Promise<{ success: boolean; files?: Array<{ filename: string; url: string }>; error?: string }> {
  try {
    const user = currentUser();
    if (!user) {
      return { success: false, error: 'Debe iniciar sesión' };
    }
    
    const ticket = await pb.collection('tickets').getOne(ticketId);
    
    // Check access
    if (user.rol === 'cliente' && ticket.user_id !== user.id) {
      return { success: false, error: 'No tiene acceso a este ticket' };
    }
    
    const adjuntos = (ticket.adjuntos as string[]) || [];
    const files = adjuntos.map(filename => ({
      filename,
      url: pb.files.getUrl(ticket, filename),
    }));
    
    return { success: true, files };
  } catch (error) {
    console.error('Error getting attachment info:', error);
    return { success: false, error: 'Error al obtenir información de archivos' };
  }
}