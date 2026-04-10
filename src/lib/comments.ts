import { pb, getPb } from './pocketbase';
import { currentUser } from './auth';
import { z } from 'zod';

export interface Comment {
  id: string;
  ticket: string;
  contenido: string;
  es_interno: boolean;
  autor: string;
  created: string;
  updated: string;
  expand?: {
    autor?: {
      first_name?: string;
      last_name?: string;
      email: string;
    };
  };
}

export const commentSchema = z.object({
  contenido: z.string().min(1, 'El contenido es requerido'),
  es_interno: z.boolean().optional().default(false),
  ticket: z.string().min(1, 'El ticket es requerido'),
});

export type CommentInput = z.infer<typeof commentSchema>;

function initAuthFromCookie() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem("pb_auth");
  if (stored) {
    try {
      const authData = JSON.parse(stored);
      const pb = getPb();
      pb.authStore.save(authData.token, authData.model);
    } catch (e) {
      console.error('Failed to load auth:', e);
    }
  }
}

export async function getCommentsByTicket(
  ticketId: string,
  includeInternal: boolean = false
): Promise<Comment[]> {
  initAuthFromCookie();
  const pb = getPb();
  const user = currentUser();
  
  const isClient = user?.rol === 'cliente';
  
  const filter = `ticket = "${ticketId}"`;
  
  const records = await pb.collection('comentarios').getList<Comment>(1, 100, {
    filter,
    sort: 'created',
    expand: 'autor',
  });
  
  let comments = records.items;
  
  if (isClient) {
    comments = comments.filter(c => !c.es_interno);
  }
  
  return comments;
}

export async function getAllCommentsByTicket(ticketId: string): Promise<Comment[]> {
  initAuthFromCookie();
  const pb = getPb();
  
  const records = await pb.collection('comentarios').getList<Comment>(1, 100, {
    filter: `ticket = "${ticketId}"`,
    sort: 'created',
    expand: 'autor',
  });
  
  return records.items;
}