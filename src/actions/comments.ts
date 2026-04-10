'use server';

import { pb } from '@/lib/pocketbase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { commentSchema, CommentInput } from '@/lib/comments';

async function loadAuth() {
  'use server';
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth')?.value;
  
  if (authCookie) {
    try {
      const authData = JSON.parse(decodeURIComponent(authCookie));
      pb.authStore.save(authData.token, authData.model);
    } catch (e) {
      console.error('Failed to load auth:', e);
    }
  }
}

export async function addComment(data: CommentInput) {
  await loadAuth();
  
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return { success: false, error: 'No autorizado' };
  }
  
  const user = pb.authStore.model as any;
  
  if (data.es_interno && user.rol === 'cliente') {
    return { success: false, error: 'Los clientes no pueden crear comentarios internos' };
  }
  
  const validation = commentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  
  try {
    const comment = await pb.collection('comentarios').create({
      ticket: data.ticket,
      contenido: data.contenido,
      es_interno: data.es_interno || false,
      autor: user.id,
    });
    
    revalidatePath(`/tickets/${data.ticket}`);
    return { success: true, comment };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}