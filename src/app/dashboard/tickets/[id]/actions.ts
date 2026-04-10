'use server';

import { pb } from '@/lib/pocketbase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

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

export async function takeTicket(ticketId: string) {
  'use server';
  await loadAuth();
  
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return { error: 'No autorizado' };
  }
  
  const user = pb.authStore.model as any;
  if (user.rol !== 'agente' && user.rol !== 'supervisor') {
    return { error: 'Solo agentes pueden tomar tickets' };
  }
  
  try {
    await pb.collection('tickets').update(ticketId, {
      asignado_a: user.id,
      estado: 'en_proceso',
    });
    
    revalidatePath('/tickets');
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateTicketStatus(ticketId: string, newStatus: string) {
  'use server';
  await loadAuth();
  
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return { error: 'No autorizado' };
  }
  
  const user = pb.authStore.model as any;
  if (user.rol !== 'agente' && user.rol !== 'supervisor') {
    return { error: 'Solo agentes pueden cambiar estado' };
  }
  
  const validTransitions: Record<string, string[]> = {
    nuevo: ['en_proceso', 'cerrado'],
    en_proceso: ['en_espera', 'resuelto', 'cerrado'],
    en_espera: ['en_proceso', 'cerrado'],
    resuelto: ['reabierto', 'cerrado'],
    reabierto: ['en_proceso', 'cerrado'],
    cerrado: ['reabierto'],
  };
  
  try {
    const ticket = await pb.collection('tickets').getOne(ticketId);
    const allowed = validTransitions[ticket.estado] || [];
    
    if (!allowed.includes(newStatus)) {
      return { error: `Transición no permitida de ${ticket.estado} a ${newStatus}` };
    }
    
    const updateData: any = { estado: newStatus };
    if (newStatus === 'cerrado') {
      updateData.cerrado_en = new Date().toISOString();
    }
    
    await pb.collection('tickets').update(ticketId, updateData);
    
    revalidatePath('/tickets');
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function reassignTicket(ticketId: string, newAgentId: string) {
  'use server';
  await loadAuth();
  
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return { error: 'No autorizado' };
  }
  
  const user = pb.authStore.model as any;
  if (user.rol !== 'supervisor') {
    return { error: 'Solo supervisores pueden reasignar tickets' };
  }
  
  try {
    await pb.collection('tickets').update(ticketId, {
      asignado_a: newAgentId,
    });
    
    revalidatePath('/tickets');
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateTicketPriority(ticketId: string, newPriority: string) {
  'use server';
  await loadAuth();
  
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return { error: 'No autorizado' };
  }
  
  const user = pb.authStore.model as any;
  if (user.rol !== 'agente' && user.rol !== 'supervisor') {
    return { error: 'Solo agentes pueden cambiar prioridad' };
  }
  
  try {
    await pb.collection('tickets').update(ticketId, {
      prioridad: newPriority,
    });
    
    revalidatePath('/tickets');
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export { loadAuth };
