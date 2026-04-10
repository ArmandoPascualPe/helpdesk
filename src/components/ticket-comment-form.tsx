'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema, CommentInput } from '@/lib/comments';
import { addComment } from '@/actions/comments';

interface TicketCommentFormProps {
  ticketId: string;
  userRole: 'cliente' | 'agente' | 'supervisor';
}

export function TicketCommentForm({ ticketId, userRole }: TicketCommentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      ticket: ticketId,
      es_interno: false,
    },
  });

  const onSubmit = async (data: CommentInput) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    const result = await addComment({
      ...data,
      ticket: ticketId,
    });
    
    if (result.success) {
      reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Error al agregar comentario');
    }
    
    setSubmitting(false);
  };

  const canAddInternal = userRole === 'agente' || userRole === 'supervisor';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <textarea
          {...register('contenido')}
          placeholder="Escribe un comentario..."
          className="w-full border rounded-lg p-3 min-h-[100px] resize-y"
          disabled={submitting}
        />
        {errors.contenido && (
          <p className="text-red-500 text-sm mt-1">{errors.contenido.message}</p>
        )}
      </div>

      {canAddInternal && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="es_interno"
            {...register('es_interno')}
            className="rounded"
          />
          <label htmlFor="es_interno" className="text-sm text-gray-600">
            Comentario interno (solo visible para agentes y supervisores)
          </label>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">Comentario agregado correctamente</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Enviando...' : 'Agregar Comentario'}
      </button>
    </form>
  );
}