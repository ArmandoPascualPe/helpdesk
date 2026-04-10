'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getPb } from '@/lib/pocketbase';

interface TicketStats {
  byStatus: { name: string; value: number; color: string }[];
  byPriority: { name: string; value: number; color: string }[];
  byDepartment: { name: string; value: number }[];
}

interface Department {
  id: string;
  nombre: string;
}

const STATUS_COLORS = {
  abierto: '#22C55E',
  en_proceso: '#F59E0B',
  cerrado: '#6B7280',
};

const PRIORITY_COLORS = {
  baja: '#22C55E',
  media: '#F59E0B',
  alta: '#EF4444',
  critica: '#991B1B',
};

export function DashboardCharts() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const pb = getPb();
      
      const ticketsResult = await pb.collection('tickets').getFullList({
        sort: 'created',
      });
      
      const deptsResult = await pb.collection('departamentos').getFullList<Department>();
      const departmentsMap = new Map(deptsResult.map(d => [d.id, d.nombre]));
      
      const statusCounts: Record<string, number> = {
        abierto: 0,
        en_proceso: 0,
        cerrado: 0,
      };
      
      const priorityCounts: Record<string, number> = {
        baja: 0,
        media: 0,
        alta: 0,
        critica: 0,
      };
      
      const deptCounts: Record<string, number> = {};
      
      ticketsResult.forEach((ticket: any) => {
        const estado = ticket.estado || 'abierto';
        const prioridad = ticket.prioridad || 'media';
        const dept = ticket.departamento || 'sin_departamento';
        
        statusCounts[estado] = (statusCounts[estado] || 0) + 1;
        priorityCounts[prioridad] = (priorityCounts[prioridad] || 0) + 1;
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      
      const byStatus = [
        { name: 'Abierto', value: statusCounts.abierto, color: STATUS_COLORS.abierto },
        { name: 'En Proceso', value: statusCounts.en_proceso, color: STATUS_COLORS.en_proceso },
        { name: 'Cerrado', value: statusCounts.cerrado, color: STATUS_COLORS.cerrado },
      ];
      
      const byPriority = [
        { name: 'Baja', value: priorityCounts.baja, color: PRIORITY_COLORS.baja },
        { name: 'Media', value: priorityCounts.media, color: PRIORITY_COLORS.media },
        { name: 'Alta', value: priorityCounts.alta, color: PRIORITY_COLORS.alta },
        { name: 'Crítica', value: priorityCounts.critica, color: PRIORITY_COLORS.critica },
      ];
      
      const byDepartment = Object.entries(deptCounts).map(([deptId, count]) => ({
        name: departmentsMap.get(deptId) || deptId,
        value: count,
      }));
      
      setStats({ byStatus, byPriority, byDepartment });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-gray-500">Cargando estadísticas...</div>;
  }

  if (!stats) {
    return <div className="text-gray-500">No hay datos disponibles</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-center">Tickets por Estado</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={stats.byStatus}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }: any) => `${name}: ${value}`}
            >
              {stats.byStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-center">Tickets por Prioridad</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.byPriority}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              {stats.byPriority.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-center">Tickets por Departamento</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.byDepartment} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}