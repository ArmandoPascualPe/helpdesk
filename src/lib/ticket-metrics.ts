import { getPb } from './pocketbase';

export interface TicketMetric {
  name: string;
  value: number;
}

export async function getAverageResolutionTime(): Promise<number | null> {
  const pb = getPb();
  console.log('getAverageResolutionTime - started');
  
  try {
    const tickets = await pb.collection('tickets').getFullList();
    console.log('getAverageResolutionTime - total tickets:', tickets.length);
    
    const closedTickets = tickets.filter((t: any) => t.estado === 'cerrado');
    console.log('getAverageResolutionTime - tickets cerrados:', closedTickets.length);
    
    const ticketsWithClosedDate = closedTickets.filter((t: any) => t.cerrado_en);
    console.log('getAverageResolutionTime - tickets con cerrado_en:', ticketsWithClosedDate.length);
    
    if (ticketsWithClosedDate.length === 0) {
      return null;
    }
    
    let totalDays = 0;
    
    ticketsWithClosedDate.forEach((ticket: any) => {
      const createdDate = new Date(ticket.created);
      const resolvedDate = new Date(ticket.cerrado_en);
      const days = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      totalDays += days;
    });
    
    return Math.round(totalDays / ticketsWithClosedDate.length);
  } catch (error: any) {
    console.error('Error calculating average resolution time:', error);
    console.error('Error details:', error.message, error.status);
    return null;
  }
}

export async function getTicketsByStatus(): Promise<TicketMetric[]> {
  const pb = getPb();
  
  try {
    const tickets = await pb.collection('tickets').getFullList();
    
    const counts: Record<string, number> = {
      abierto: 0,
      en_proceso: 0,
      en_espera: 0,
      cerrado: 0,
    };
    
    tickets.forEach((ticket: any) => {
      const estado = ticket.estado || 'abierto';
      counts[estado] = (counts[estado] || 0) + 1;
    });
    
    return [
      { name: 'Abierto', value: counts.abierto },
      { name: 'En Proceso', value: counts.en_proceso },
      { name: 'En Espera', value: counts.en_espera },
      { name: 'Cerrado', value: counts.cerrado },
    ];
  } catch (error) {
    console.error('Error getting tickets by status:', error);
    return [];
  }
}

export async function getTicketsByPriority(): Promise<TicketMetric[]> {
  const pb = getPb();
  
  try {
    const tickets = await pb.collection('tickets').getFullList();
    
    const counts: Record<string, number> = {
      baja: 0,
      media: 0,
      alta: 0,
      critica: 0,
    };
    
    tickets.forEach((ticket: any) => {
      const prioridad = ticket.prioridad || 'media';
      counts[prioridad] = (counts[prioridad] || 0) + 1;
    });
    
    return [
      { name: 'Baja', value: counts.baja },
      { name: 'Media', value: counts.media },
      { name: 'Alta', value: counts.alta },
      { name: 'Crítica', value: counts.critica },
    ];
  } catch (error) {
    console.error('Error getting tickets by priority:', error);
    return [];
  }
}

export async function getTicketsByDepartment(): Promise<TicketMetric[]> {
  const pb = getPb();
  
  try {
    const tickets = await pb.collection('tickets').getFullList();
    const departments = await pb.collection('departamentos').getFullList();
    
    const deptMap = new Map(departments.map((d: any) => [d.id, d.nombre]));
    const counts: Record<string, number> = {};
    
    tickets.forEach((ticket: any) => {
      const deptId = ticket.departamento || 'sin_departamento';
      counts[deptId] = (counts[deptId] || 0) + 1;
    });
    
    return Object.entries(counts).map(([deptId, count]) => ({
      name: deptMap.get(deptId) || deptId,
      value: count,
    }));
  } catch (error) {
    console.error('Error getting tickets by department:', error);
    return [];
  }
}