'use client';

import { useEffect, useState } from 'react';
import { Comment, getCommentsByTicket } from '@/lib/comments';

interface TicketCommentsListProps {
  ticketId: string;
  userRole: 'cliente' | 'agente' | 'supervisor';
}

export function TicketCommentsList({ ticketId, userRole }: TicketCommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
      const includeInternal = userRole === 'agente' || userRole === 'supervisor';
      const data = await getCommentsByTicket(ticketId, includeInternal);
      setComments(data);
      setLoading(false);
    }
    loadComments();
  }, [ticketId, userRole]);

  if (loading) {
    return <div className="text-gray-500">Cargando comentarios...</div>;
  }

  if (comments.length === 0) {
    return <div className="text-gray-500">No hay comentarios aún</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const autorName = comment.expand?.autor?.first_name 
          ? `${comment.expand.autor.first_name} ${comment.expand.autor.last_name || ''}`.trim()
          : comment.expand?.autor?.email || 'Usuario';
        
        return (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">{autorName}</div>
              <div className="flex items-center gap-2">
                {comment.es_interno && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Interno
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  {new Date(comment.created).toLocaleString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <p className="whitespace-pre-wrap">{comment.contenido}</p>
          </div>
        );
      })}
    </div>
  );
}