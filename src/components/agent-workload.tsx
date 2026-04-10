'use client';

import { useEffect, useState } from 'react';
import { getPb } from '@/lib/pocketbase';

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
      const pb = getPb();
      
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
    return <div className="text-gray-500">Cargando workload...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Carga de Trabajo de Agentes</h3>
      
      {workloads.length === 0 ? (
        <p className="text-gray-500">No hay agentes registrados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Agente</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Abiertos</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Resueltos</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workloads.map((wl) => (
                <tr key={wl.agent.id}>
                  <td className="px-4 py-2">
                    {wl.agent.first_name} {wl.agent.last_name}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      {wl.openTickets}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {wl.resolvedTickets}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center font-medium">
                    {wl.totalLoad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}