'use client';

import { useEffect, useState } from 'react';
import { getPb } from '@/lib/pocketbase';

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
}

export function OverdueTickets({ thresholdDays = 7 }: OverdueTicketsProps) {
  const [tickets, setTickets] = useState<(Ticket & { departmentName: string; daysOpen: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverdueTickets();
  }, [thresholdDays]);

  async function loadOverdueTickets() {
    setLoading(true);
    try {
      const pb = getPb();
      
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
    return <div className="text-gray-500">Cargando tickets vencidos...</div>;
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baja': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">
        Tickets Abiertos Más de {thresholdDays} Días
      </h3>
      
      {tickets.length === 0 ? (
        <p className="text-gray-500">No hay tickets vencidos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ticket</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Título</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Departamento</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Prioridad</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Días</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="bg-red-50 border-l-4 border-red-400">
                  <td className="px-4 py-2 text-sm font-medium">
                    {ticket.ticket_number}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {ticket.titulo}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {ticket.departmentName}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.prioridad)}`}>
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center font-medium text-red-600">
                    {ticket.daysOpen}
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