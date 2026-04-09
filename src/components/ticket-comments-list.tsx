'use client';

import { useState, useEffect } from 'react';
import { getCommentsByTicket, Comment } from '@/lib/comments';
import { currentUser } from '@/lib/auth';
import { pb } from '@/lib/pocketbase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketCommentsListProps {
  ticketId: string;
  refreshTrigger?: number;
}

export function TicketCommentsList({ ticketId, refreshTrigger = 0 }: TicketCommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = currentUser();
  const canSeeInternal = user?.rol === 'agente' || user?.rol === 'supervisor';
  
  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCommentsByTicket(ticketId, false);
        setComments(data);
      } catch (err: any) {
        console.error('Error fetching comments:', err);
        setError('Error al cargar comentarios');
        setComments([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchComments();
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
      for (const comment of comments) {
        if (!userNames[comment.user_id]) {
          names[comment.user_id] = await getUserName(comment.user_id);
        }
      }
      if (Object.keys(names).length > 0) {
        setUserNames(prev => ({ ...prev, ...names }));
      }
    }
    loadUserNames();
  }, [comments]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: es });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <p className="text-gray-500 text-sm">Cargando comentarios...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  if (comments.length === 0) {
    return <p className="text-gray-500 text-sm">No hay comentarios aún</p>;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {userNames[comment.user_id] || 'Cargando...'}
              </span>
              {comment.is_internal && (
                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Interno
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(comment.created)}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}