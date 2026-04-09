import { pb } from './pocketbase';
import { currentUser } from './auth';
import { z } from 'zod';

export interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created: string;
  updated: string;
}

export const commentSchema = z.object({
  ticket_id: z.string().min(1, 'Ticket ID requerido'),
  content: z.string().min(1, 'Contenido requerido'),
  is_internal: z.boolean().default(false),
});

export type CommentInput = z.infer<typeof commentSchema>;

/**
 * Get comments by ticket ID.
 * Filters internal comments for cliente role (D-02).
 * Returns chronological order (created asc) (D-03).
 */
export async function getCommentsByTicket(
  ticketId: string,
  includeInternal: boolean = false
): Promise<Comment[]> {
  const user = currentUser();
  
  // Determine if user can see internal comments
  const canSeeInternal = user?.rol === 'agente' || user?.rol === 'supervisor';
  
  // Build filter: always filter by ticket
  let filter = `ticket_id = "${ticketId}"`;
  
  // If user is cliente, exclude internal comments entirely
  // If user is agente/supervisor and includeInternal not requested, also exclude
  if (user?.rol === 'cliente' || (!includeInternal && !canSeeInternal)) {
    filter += ' && is_internal = false';
  }
  
  const records = await pb.collection('comentarios').getList<Comment>(1, 100, {
    filter,
    sort: 'created',
  });
  
  // Additional filter for internal comments on client side if needed
  let comments = records.items;
  if (user?.rol === 'cliente') {
    // Already filtered at API level, but double-check
    comments = comments.filter(c => !c.is_internal);
  }
  
  return comments;
}

export async function getCommentsByTicketForClient(ticketId: string): Promise<Comment[]> {
  return getCommentsByTicket(ticketId, false);
}