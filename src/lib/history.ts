import { pb, getPb } from './pocketbase';

export type ChangeType = 'STATE_CHANGE' | 'ASSIGNMENT_CHANGE' | 'PRIORITY_CHANGE';

export interface HistoryEntry {
  id: string;
  ticket: string;
  campo: string;
  valor_anterior: string;
  valor_nuevo: string;
  modificado_por: string;
  created: string;
  expand?: {
    modificado_por?: {
      first_name?: string;
      last_name?: string;
      email: string;
    };
  };
}

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

export async function getHistoryByTicket(ticketId: string): Promise<HistoryEntry[]> {
  initAuthFromCookie();
  const pb = getPb();
  
  const records = await pb.collection('historial_tickets').getList<HistoryEntry>(1, 100, {
    filter: `ticket = "${ticketId}"`,
    sort: '-created',
    expand: 'modificado_por',
  });
  
  return records.items;
}

export async function recordHistory(data: {
  ticket_id: string;
  change_type: ChangeType;
  old_value: string;
  new_value: string;
}, userId: string): Promise<HistoryEntry> {
  const pb = getPb();
  
  const campoMap: Record<ChangeType, string> = {
    STATE_CHANGE: 'estado',
    ASSIGNMENT_CHANGE: 'asignado_a',
    PRIORITY_CHANGE: 'prioridad',
  };
  
  const historyEntry = await pb.collection('historial_tickets').create({
    ticket: data.ticket_id,
    campo: campoMap[data.change_type],
    valor_anterior: data.old_value,
    valor_nuevo: data.new_value,
    modificado_por: userId,
  });
  
  return historyEntry;
}