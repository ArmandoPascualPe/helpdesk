'use client';

import { useEffect, useState } from 'react';
import { getPb } from '@/lib/pocketbase';

export function AvgResolutionTime() {
  const [avgDays, setAvgDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    try {
      const pb = getPb();
      const tickets = await pb.collection('tickets').getFullList();
      
      const closedTickets = tickets.filter((t: any) => t.estado === 'cerrado');
      const ticketsWithClosedDate = closedTickets.filter((t: any) => t.cerrado_en);
      
      if (ticketsWithClosedDate.length === 0) {
        setAvgDays(null);
      } else {
        let totalDays = 0;
        ticketsWithClosedDate.forEach((ticket: any) => {
          const createdDate = new Date(ticket.created);
          const resolvedDate = new Date(ticket.cerrado_en);
          const days = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          totalDays += days;
        });
        setAvgDays(Math.round(totalDays / ticketsWithClosedDate.length));
      }
    } catch (error) {
      console.error('Error loading resolution time:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-2">Tiempo Promedio de Resolución</h3>
      {avgDays !== null ? (
        <div className="text-center py-4">
          <span className="text-5xl font-bold text-blue-600">{avgDays}</span>
          <span className="text-xl text-gray-600"> días</span>
          <p className="text-sm text-gray-500 mt-2">
            Promedio de todos los tickets cerrados
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No hay suficientes datos para calcular el promedio
        </p>
      )}
    </div>
  );
}