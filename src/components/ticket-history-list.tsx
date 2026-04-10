'use client';

import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

interface TicketHistoryListProps {
  ticketId: string;
}

export function TicketHistoryList({ ticketId }: TicketHistoryListProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function loadHistory() {
      try {
        const stored = localStorage.getItem("pb_auth");
        if (stored) {
          const authData = JSON.parse(stored);
          pb.authStore.save(authData.token, authData.model);
        }
        
        const records = await pb.collection('historial_tickets').getList(1, 100, {
          filter: `ticket = "${ticketId}"`,
          sort: '-created',
          expand: 'modificado_por',
        });
        
        if (isMounted) {
          setHistory(records.items);
        }
      } catch (e: any) {
        if (isMounted && !e.message?.includes('aborted')) {
          console.error('Error loading history:', e);
          setError('Error al cargar historial');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadHistory();
    
    return () => {
      isMounted = false;
    };
  }, [ticketId]);

  const getChangeTypeLabel = (campo: string): string => {
    switch (campo) {
      case 'estado':
        return 'Estado';
      case 'asignado_a':
        return 'Asignación';
      case 'prioridad':
        return 'Prioridad';
      default:
        return campo;
    }
  };

  const formatValue = (value: string): string => {
    if (!value || value === 'Sin asignar') return value;
    return value;
  };

  if (loading) {
    return <div className="text-gray-500">Cargando historial...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No hay historial de cambios
      </div>
    );
  }

  return (
    <div className="border-t pt-4 mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-semibold text-lg hover:text-blue-600"
      >
        <span>Historial de Cambios ({history.length})</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-2">
          {history.map((entry) => {
            const userName = entry.expand?.modificado_por?.first_name
              ? `${entry.expand.modificado_por.first_name} ${entry.expand.modificado_por.last_name || ''}`.trim()
              : entry.expand?.modificado_por?.email || 'Usuario';
              
            return (
              <div key={entry.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{getChangeTypeLabel(entry.campo)}</span>
                    <span className="text-gray-500 text-sm mx-2">cambiado por</span>
                    <span className="font-medium">{userName}</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(entry.created).toLocaleString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-gray-600">{formatValue(entry.valor_anterior)}</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-600 font-medium">{formatValue(entry.valor_nuevo)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}