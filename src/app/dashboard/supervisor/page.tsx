'use client';

import { useEffect, useState } from 'react';
import { getPb } from '@/lib/pocketbase';
import { DashboardCharts } from '@/components/dashboard-charts';
import { AgentWorkload } from '@/components/agent-workload';
import { OverdueTickets } from '@/components/overdue-tickets';

interface User {
  id: string;
  rol: string;
  first_name: string;
  last_name: string;
}

export default function SupervisorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [thresholdDays, setThresholdDays] = useState(7);
  const [avgResolutionDays, setAvgResolutionDays] = useState<number | null>(null);
  const [closedTicketsCount, setClosedTicketsCount] = useState(0);

  useEffect(() => {
    loadUserAndMetrics();
  }, []);

  async function loadUserAndMetrics() {
    setLoading(true);
    try {
      const pb = getPb();
      
      if (pb.authStore.model) {
        setUser(pb.authStore.model as unknown as User);
      }
      
      const ticketsResult = await pb.collection('tickets').getFullList();
      
      const closedTickets = ticketsResult.filter((t: any) => t.estado === 'cerrado' && t.created);
      
      if (closedTickets.length > 0) {
        const now = new Date();
        let totalDays = 0;
        
        closedTickets.forEach((ticket: any) => {
          const createdDate = new Date(ticket.created);
          const days = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          totalDays += days;
        });
        
        setAvgResolutionDays(Math.round(totalDays / closedTickets.length));
        setClosedTicketsCount(closedTickets.length);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-gray-500">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard del Supervisor</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Tickets abiertos hace más de:</label>
          <select
            value={thresholdDays}
            onChange={(e) => setThresholdDays(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5 días</option>
            <option value={7}>7 días</option>
            <option value={10}>10 días</option>
            <option value={14}>14 días</option>
          </select>
        </div>
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentWorkload />
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Tiempo Promedio de Resolución</h3>
          {avgResolutionDays !== null ? (
            <div className="text-center">
              <span className="text-4xl font-bold text-blue-600">{avgResolutionDays}</span>
              <span className="text-lg text-gray-600"> días promedio</span>
              <p className="text-sm text-gray-500 mt-2">
                Basado en {closedTicketsCount} tickets cerrados
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No hay suficientes datos</p>
          )}
        </div>
      </div>

      <OverdueTickets thresholdDays={thresholdDays} />
    </div>
  );
}