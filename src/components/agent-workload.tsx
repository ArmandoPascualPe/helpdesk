'use client';

import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
}

interface Ticket {
  id: string;
  estado: string;
  asignado_a: string;
}

interface AgentWorkload {
  agent: Agent;
  openTickets: number;
  resolvedTickets: number;
  totalLoad: number;
}

export function AgentWorkload() {
  const [workloads, setWorkloads] = useState<AgentWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkloads();
  }, []);

  async function loadWorkloads() {
    setLoading(true);
    try {
      const stored = localStorage.getItem("pb_auth");
      if (stored) {
        const authData = JSON.parse(stored);
        pb.authStore.save(authData.token, authData.model);
      }
      
      const agentsResult = await pb.collection('usuarios').getFullList<Agent>({
        filter: 'rol = "agente"',
      });
      
      const ticketsResult = await pb.collection('tickets').getFullList<Ticket>();
      
      const workloadsMap: Record<string, AgentWorkload> = {};
      
      agentsResult.forEach(agent => {
        workloadsMap[agent.id] = {
          agent,
          openTickets: 0,
          resolvedTickets: 0,
          totalLoad: 0,
        };
      });
      
      ticketsResult.forEach((ticket: Ticket) => {
        if (ticket.asignado_a && workloadsMap[ticket.asignado_a]) {
          if (ticket.estado === 'cerrado') {
            workloadsMap[ticket.asignado_a].resolvedTickets++;
          } else {
            workloadsMap[ticket.asignado_a].openTickets++;
          }
          workloadsMap[ticket.asignado_a].totalLoad++;
        }
      });
      
      const workloadsArray = Object.values(workloadsMap).sort(
        (a, b) => b.totalLoad - a.totalLoad
      );
      
      setWorkloads(workloadsArray);
    } catch (error) {
      console.error('Error loading workloads:', error);
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="rounded-lg" style={{ backgroundColor: 'var(--beige-medium)' }}>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-widest rounded-l-lg" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>Agente</th>
            <th className="px-4 py-3 text-center text-xs uppercase tracking-widest" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>Abiertos</th>
            <th className="px-4 py-3 text-center text-xs uppercase tracking-widest" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>Resueltos</th>
            <th className="px-4 py-3 text-center text-xs uppercase tracking-widest rounded-r-lg" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>Total</th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'var(--card-bg)' }}>
          {workloads.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                No hay agentes registrados
              </td>
            </tr>
          ) : (
            workloads.map((wl, idx) => (
              <tr key={wl.agent.id} className="border-t transition-all duration-300 hover:bg-[var(--beige-light)]" style={{ borderColor: 'var(--beige-dark)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--wood-medium)', color: 'var(--beige-light)' }}>
                      {wl.agent.first_name?.[0] || '?'}{wl.agent.last_name?.[0] || ''}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>
                      {wl.agent.first_name} {wl.agent.last_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>
                    {wl.openTickets}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                    {wl.resolvedTickets}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-lg font-semibold" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)' }}>
                    {wl.totalLoad}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}