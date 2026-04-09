'use client';

import { useState, useEffect } from 'react';
import { getHistoryByTicket, HistoryEntry, ChangeType } from '@/lib/history';
import { pb } from '@/lib/pocketbase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketHistoryListProps {
  ticketId: string;
  refreshTrigger?: number;
}

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  STATE_CHANGE: 'Estado cambiado',
  ASSIGNMENT_CHANGE: 'Asignación cambiada',
  PRIORITY_CHANGE: 'Prioridad cambiada',
};

const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  STATE_CHANGE: 'bg-blue-100 text-blue-800',
  ASSIGNMENT_CHANGE: 'bg-purple-100 text-purple-800',
  PRIORITY_CHANGE: 'bg-orange-100 text-orange-800',
};

export function TicketHistoryList({ ticketId, refreshTrigger = 0 }: TicketHistoryListProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const data = await getHistoryByTicket(ticketId);
        setEntries(data);
      } catch (err: any) {
        console.error('Error fetching history:', err);
        setError('Error al cargar historial');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, [ticketId, refreshTrigger]);

  const getUserName = async (userId: string): Promise<string> => {
    try {
      const userRecord = await pb.collection('usuarios').getOne(userId, {
        fields: 'first_name,last_name,email',
      });
      return `${userRecord.first_name} ${userRecord.last_name}`;
    } catch {
      return 'Usuario desconocido';
    }
  };

  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadUserNames() {
      const names: Record<string, string> = {};
      for (const entry of entries) {
        if (!userNames[entry.user_id]) {
          names[entry.user_id] = await getUserName(entry.user_id);
        }
      }
      if (Object.keys(names).length > 0) {
        setUserNames(prev => ({ ...prev, ...names }));
      }
    }
    loadUserNames();
  }, [entries]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: es });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <p className="text-gray-500 text-sm">Cargando historial...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  if (entries.length === 0) {
    return <p className="text-gray-500 text-sm">No hay historial de cambios</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs rounded ${CHANGE_TYPE_COLORS[entry.change_type]}`}>
                {CHANGE_TYPE_LABELS[entry.change_type]}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(entry.created)}
            </span>
          </div>
          
          <div className="text-sm">
            {entry.old_value && entry.new_value && (
              <p>
                <span className="text-gray-600">{entry.old_value}</span>
                {' → '}
                <span className="font-medium text-gray-900">{entry.new_value}</span>
              </p>
            )}
            {entry.old_value && !entry.new_value && (
              <p>
                <span className="text-gray-600">Eliminado: {entry.old_value}</span>
              </p>
            )}
            {!entry.old_value && entry.new_value && (
              <p>
                <span className="font-medium text-gray-900">Establecido: {entry.new_value}</span>
              </p>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Por: {userNames[entry.user_id] || 'Cargando...'}
          </p>
        </div>
      ))}
    </div>
  );
}