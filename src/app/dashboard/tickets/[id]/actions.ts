'use server';

import { pb } from '@/lib/pocketbase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { recordHistory, ChangeType } from '@/lib/history';

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
    const ticket = await pb.collection('tickets').getOne(ticketId);
    const oldAssigned = ticket.asignado_a;
    
    await pb.collection('tickets').update(ticketId, {
      asignado_a: user.id,
      estado: 'en_proceso',
    });
    
    if (oldAssigned !== user.id) {
      await recordHistory({
        ticket_id: ticketId,
        change_type: 'ASSIGNMENT_CHANGE' as ChangeType,
        old_value: oldAssigned || 'Sin asignar',
        new_value: user.id,
      }, user.id);
    }
    
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
    
    const oldStatus = ticket.estado;
    const updateData: any = { estado: newStatus };
    if (newStatus === 'cerrado') {
      updateData.cerrado_en = new Date().toISOString();
    } else if (oldStatus === 'cerrado' && newStatus !== 'cerrado') {
      updateData.cerrado_en = null;
    }
    
    await pb.collection('tickets').update(ticketId, updateData);
    
    if (oldStatus !== newStatus) {
      await recordHistory({
        ticket_id: ticketId,
        change_type: 'STATE_CHANGE' as ChangeType,
        old_value: oldStatus,
        new_value: newStatus,
      }, user.id);
    }
    
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
    const ticket = await pb.collection('tickets').getOne(ticketId);
    const oldAssigned = ticket.asignado_a;
    
    await pb.collection('tickets').update(ticketId, {
      asignado_a: newAgentId,
    });
    
    if (oldAssigned !== newAgentId) {
      await recordHistory({
        ticket_id: ticketId,
        change_type: 'ASSIGNMENT_CHANGE' as ChangeType,
        old_value: oldAssigned || 'Sin asignar',
        new_value: newAgentId,
      }, user.id);
    }
    
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
    const ticket = await pb.collection('tickets').getOne(ticketId);
    const oldPriority = ticket.prioridad;
    
    await pb.collection('tickets').update(ticketId, {
      prioridad: newPriority,
    });
    
    if (oldPriority !== newPriority) {
      await recordHistory({
        ticket_id: ticketId,
        change_type: 'PRIORITY_CHANGE' as ChangeType,
        old_value: oldPriority,
        new_value: newPriority,
      }, user.id);
    }
    
    revalidatePath('/tickets');
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export { loadAuth };
