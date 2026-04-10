'use server';

import { pb } from '@/lib/pocketbase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

export async function downloadAttachment(ticketId: string, filename: string) {
  await loadAuth();
  
  if (!pb.authStore.isValid) {
    return { error: 'No autorizado' };
  }
  
  try {
    const ticket = await pb.collection('tickets').getOne(ticketId);
    
    if (!ticket.archivos || !ticket.archivos.includes(filename)) {
      return { error: 'Archivo no encontrado' };
    }
    
    const fileUrl = pb.files.getUrl(ticket, filename);
    
    redirect(fileUrl);
  } catch (e: any) {
    return { error: e.message };
  }
}