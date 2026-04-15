'use client';

import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';
import { DashboardCharts } from '@/components/dashboard-charts';
import { AgentWorkload } from '@/components/agent-workload';
import { OverdueTickets } from '@/components/overdue-tickets';
import { AvgResolutionTime } from '@/components/avg-resolution-time';

const pb = new PocketBase('http://127.0.0.1:8090');

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
  const [autoCloseLoading, setAutoCloseLoading] = useState(false);
  const [autoCloseMessage, setAutoCloseMessage] = useState("");

  useEffect(() => {
    loadUserAndMetrics();
  }, []);

  useEffect(() => {
    if (!loading && user && user.rol !== "supervisor") {
      window.location.href = "/dashboard/tickets";
    }
  }, [loading, user]);

  async function handleAutoClose() {
    setAutoCloseLoading(true);
    setAutoCloseMessage("");
    
    try {
      const stored = localStorage.getItem("pb_auth");
      if (!stored) {
        setAutoCloseMessage("No hay sesión");
        setAutoCloseLoading(false);
        return;
      }
      
      const authData = JSON.parse(stored);
      const response = await fetch("/api/auto-close", {
        method: "POST",
        headers: {
          Authorization: `pb_auth ${authData.token}`,
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setAutoCloseMessage(result.message);
      } else {
        setAutoCloseMessage(result.error || "Error al ejecutar");
      }
    } catch (e) {
      setAutoCloseMessage("Error de conexión");
    } finally {
      setAutoCloseLoading(false);
    }
  }

  async function loadUserAndMetrics() {
    setLoading(true);
    try {
      const stored = localStorage.getItem("pb_auth");
      if (stored) {
        const authData = JSON.parse(stored);
        pb.authStore.save(authData.token, authData.model);
      }
      
      if (pb.authStore.model) {
        setUser(pb.authStore.model as unknown as User);
      }
      
      const ticketsResult = await pb.collection('tickets').getFullList();
      
      const closedTickets = ticketsResult.filter((t: any) => t.estado === 'cerrado' && t.cerrado_en);
      
      if (closedTickets.length > 0) {
        let totalDays = 0;
        
        closedTickets.forEach((ticket: any) => {
          const createdDate = new Date(ticket.created);
          const resolvedDate = new Date(ticket.cerrado_en);
          const days = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[var(--wood-medium)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--wood-medium)', fontFamily: 'var(--font-cormorant)' }}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end pb-6 border-b" style={{ borderColor: 'var(--beige-dark)' }}>
        <div>
          <h1 className="text-4xl font-semibold" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--wood-dark)' }}>
            Panel de Control
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-cormorant)' }}>
            Vista general del Help Desk • {user?.first_name} {user?.last_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tickets vencidos (más de):</span>
          <select
            value={thresholdDays}
            onChange={(e) => setThresholdDays(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--beige-dark)', fontFamily: 'var(--font-cormorant)' }}
          >
            <option value={5}>5 días</option>
            <option value={7}>7 días</option>
            <option value={10}>10 días</option>
            <option value={14}>14 días</option>
          </select>
          <button
            onClick={handleAutoClose}
            disabled={autoCloseLoading}
            className="px-4 py-2 rounded-lg border text-sm transition-all duration-300 hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'var(--gold)', borderColor: 'var(--beige-dark)', fontFamily: 'var(--font-cormorant)' }}
          >
            {autoCloseLoading ? "Cerrando..." : "Cerrar resueltos (48h+)"}
          </button>
        </div>
      </div>
      
      {autoCloseMessage && (
        <div className="text-sm py-2 px-4 rounded-lg" style={{ backgroundColor: autoCloseMessage.includes("cerraron") ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: autoCloseMessage.includes("cerraron") ? '#16a34a' : '#dc2626' }}>
          {autoCloseMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--beige-dark)', boxShadow: '0 4px 20px rgba(62, 39, 35, 0.08)' }}>
          <h3 className="text-lg font-medium mb-1 text-center" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--wood-dark)' }}>
            Tiempo Promedio de Resolución
          </h3>
          {avgResolutionDays !== null ? (
            <div className="text-center py-6">
              <span className="text-6xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)' }}>{avgResolutionDays}</span>
              <span className="text-2xl ml-2" style={{ color: 'var(--wood-medium)' }}>días</span>
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                Basado en {closedTicketsCount} tickets cerrados
              </p>
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No hay suficientes datos
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--beige-dark)', boxShadow: '0 4px 20px rgba(62, 39, 35, 0.08)' }}>
          <h3 className="text-lg font-medium mb-1 text-center" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--wood-dark)' }}>
            Tickets Vencidos
          </h3>
          <OverdueTickets thresholdDays={thresholdDays} userRole={user?.rol} />
        </div>
      </div>

      <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--beige-dark)', boxShadow: '0 4px 20px rgba(62, 39, 35, 0.08)' }}>
        <DashboardCharts userRole={user?.rol} />
      </div>

      <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--beige-dark)', boxShadow: '0 4px 20px rgba(62, 39, 35, 0.08)' }}>
        <h3 className="text-xl font-medium mb-6 text-center" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--wood-dark)' }}>
          Carga de Trabajo por Agente
        </h3>
        <AgentWorkload userRole={user?.rol} />
      </div>
    </div>
  );
}