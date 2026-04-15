'use client';

import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

interface TicketStats {
  byStatus: { name: string; value: number; color: string }[];
  byPriority: { name: string; value: number; color: string }[];
  byDepartment: { name: string; value: number }[];
}

interface Department {
  id: string;
  nombre: string;
}

interface DashboardChartsProps {
  userRole?: string;
}

const STATUS_COLORS = {
  nuevo: '#2E7D32',
  en_proceso: '#F57C00',
  en_espera: '#EF6C00',
  resuelto: '#388E3C',
  cerrado: '#5D4037',
};

const STATUS_ORDER = ['nuevo', 'en_proceso', 'en_espera', 'resuelto', 'cerrado'];

const STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  en_proceso: 'En Proceso',
  en_espera: 'En Espera',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

export function DashboardCharts({ userRole }: DashboardChartsProps) {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === undefined) return;
    if (userRole && userRole !== 'supervisor') {
      setError('Solo supervisores pueden ver esta sección');
      setLoading(false);
      return;
    }
    loadStats();
  }, [userRole]);

  async function loadStats() {
    if (!userRole || userRole !== 'supervisor') return;
    setLoading(true);
    try {
      const stored = localStorage.getItem("pb_auth");
      if (stored) {
        const authData = JSON.parse(stored);
        pb.authStore.save(authData.token, authData.model);
      }
      
      const ticketsResult = await pb.collection('tickets').getFullList();
      
      const deptsResult = await pb.collection('departamentos').getFullList<Department>();
      const departmentsMap = new Map(deptsResult.map(d => [d.id, d.nombre]));
      
      const statusCounts: Record<string, number> = {};
      STATUS_ORDER.forEach(s => statusCounts[s] = 0);
      
      const priorityCounts: Record<string, number> = {
        baja: 0,
        media: 0,
        alta: 0,
        critica: 0,
      };
      
      const deptCounts: Record<string, number> = {};
      
      ticketsResult.forEach((ticket: any) => {
        const estado = ticket.estado || 'nuevo';
        const prioridad = ticket.prioridad || 'media';
        const dept = ticket.departamento || 'sin_departamento';
        
        statusCounts[estado] = (statusCounts[estado] || 0) + 1;
        priorityCounts[prioridad] = (priorityCounts[prioridad] || 0) + 1;
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      
      const byStatus = STATUS_ORDER
        .filter(s => statusCounts[s] > 0)
        .map(s => ({
          name: STATUS_LABELS[s] || s,
          value: statusCounts[s],
          color: STATUS_COLORS[s as keyof typeof STATUS_COLORS] || '#888',
        }));
      
      const byPriority = [
        { name: 'Baja', value: priorityCounts.baja, color: '#4CAF50' },
        { name: 'Media', value: priorityCounts.media, color: '#FFC107' },
        { name: 'Alta', value: priorityCounts.alta, color: '#FF7043' },
        { name: 'Crítica', value: priorityCounts.critica, color: '#C62828' },
      ].filter(p => p.value > 0);
      
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[var(--wood-medium)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--beige-light)', border: '1px solid var(--beige-dark)' }}>
        <h4 className="text-sm font-medium mb-4 text-center uppercase tracking-widest" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>
          Por Estado
        </h4>
        <div className="space-y-3">
          {stats.byStatus.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              </div>
              <span className="text-lg font-semibold" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--beige-light)', border: '1px solid var(--beige-dark)' }}>
        <h4 className="text-sm font-medium mb-4 text-center uppercase tracking-widest" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>
          Por Prioridad
        </h4>
        <div className="space-y-3">
          {stats.byPriority.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              </div>
              <span className="text-lg font-semibold" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--beige-light)', border: '1px solid var(--beige-dark)' }}>
        <h4 className="text-sm font-medium mb-4 text-center uppercase tracking-widest" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>
          Por Departamento
        </h4>
        <div className="space-y-3">
          {stats.byDepartment.length === 0 ? (
            <div className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Sin datos</div>
          ) : (
            stats.byDepartment.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                <span className="text-lg font-semibold" style={{ color: 'var(--wood-dark)', fontFamily: 'var(--font-cormorant)' }}>{item.value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}