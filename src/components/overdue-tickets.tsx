'use client';

import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

interface Ticket {
  id: string;
  ticket_number: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  created: string;
}

interface Department {
  id: string;
  nombre: string;
}

interface OverdueTicketsProps {
  thresholdDays?: number;
  userRole?: string;
}

export function OverdueTickets({ thresholdDays = 7, userRole }: OverdueTicketsProps) {
  const [tickets, setTickets] = useState<(Ticket & { departmentName: string; daysOpen: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === undefined) return;
    if (userRole && userRole !== 'supervisor') {
      setError('Solo supervisores pueden ver esta sección');
      setLoading(false);
      return;
    }
    loadOverdueTickets();
  }, [thresholdDays, userRole]);

  async function loadOverdueTickets() {
    if (!userRole || userRole !== 'supervisor') return;
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem("pb_auth");
      if (stored) {
        const authData = JSON.parse(stored);
        pb.authStore.save(authData.token, authData.model);
      }
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
      const thresholdStr = thresholdDate.toISOString().replace('Z', '+00:00');
      
      const ticketsResult = await pb.collection('tickets').getFullList({
        filter: `created <= "${thresholdStr}" && estado != "cerrado"`,
        sort: '-created',
      });
      
      const deptsResult = await pb.collection('departamentos').getFullList<Department>();
      const departmentsMap = new Map(deptsResult.map(d => [d.id, d.nombre]));
      
      const now = new Date();
      
      const ticketsWithDays = ticketsResult.map((ticket: any) => {
        const createdDate = new Date(ticket.created);
        const daysOpen = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...ticket,
          departmentName: departmentsMap.get(ticket.departamento) || 'Sin departamento',
          daysOpen,
        };
      });
      
      setTickets(ticketsWithDays);
    } catch (error) {
      console.error('Error loading overdue tickets:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[var(--wood-medium)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
        {error}
      </div>
    );
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return { bg: '#FFEBEE', color: '#C62828', border: '#EF5350' };
      case 'alta': return { bg: '#FFF3E0', color: '#E65100', border: '#FF9800' };
      case 'media': return { bg: '#FFFDE7', color: '#F9A825', border: '#FDD835' };
      case 'baja': return { bg: '#E8F5E9', color: '#2E7D32', border: '#66BB6A' };
      default: return { bg: '#ECEFF1', color: '#546E7A', border: '#90A4AE' };
    }
  };

  return (
    <div>
      {tickets.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No hay tickets vencidos
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const colors = getPriorityColor(ticket.prioridad);
            return (
              <div 
                key={ticket.id} 
                className="flex items-center justify-between p-3 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderLeftColor: colors.border,
                  boxShadow: '0 2px 8px rgba(62, 39, 35, 0.06)'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium shrink-0" style={{ color: 'var(--wood-medium)', fontFamily: 'var(--font-cormorant)' }}>
                      {ticket.ticket_number}
                    </span>
                    <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {ticket.titulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ticket.departmentName}</span>
                    <span className="text-xs" style={{ color: 'var(--beige-dark)' }}>•</span>
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: colors.bg, color: colors.color }}
                    >
                      {ticket.prioridad}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="text-2xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)' }}>
                    {ticket.daysOpen}
                  </span>
                  <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>días</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}