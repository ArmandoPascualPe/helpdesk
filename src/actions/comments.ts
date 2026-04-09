'use server';

import { pb } from '@/lib/pocketbase';
import { currentUser } from '@/lib/auth';
import { commentSchema, Comment } from '@/lib/comments';
import { z } from 'zod';

const addCommentSchema = commentSchema;

/**
 * Server Action to add a comment to a ticket.
 * Validates content and checks user authentication.
 */
export async function addComment(data: {
  ticket_id: string;
  content: string;
  is_internal?: boolean;
}): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    // Validate input
    const validated = addCommentSchema.parse(data);
    
    // Get current user
    const user = currentUser();
    if (!user) {
      return { success: false, error: 'Debe iniciar sesión para comentar' };
    }
    
    // Check if user can post internal comments
    if (validated.is_internal && user.rol === 'cliente') {
      return { success: false, error: 'No tiene permiso para comentarios internos' };
    }
    
    // Create comment in PocketBase
    const comment = await pb.collection('comentarios').create<Comment>({
      ticket_id: validated.ticket_id,
      user_id: user.id,
      content: validated.content,
      is_internal: validated.is_internal || false,
    });
    
    return { success: true, comment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Error adding comment:', error);
    return { success: false, error: 'Error al agregar comentario' };
  }
}