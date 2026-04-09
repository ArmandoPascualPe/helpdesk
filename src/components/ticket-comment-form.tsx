'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addComment } from '@/actions/comments';
import { currentUser } from '@/lib/auth';

const commentFormSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío'),
  is_internal: z.boolean().default(false),
});

type CommentFormData = z.infer<typeof commentFormSchema>;

interface TicketCommentFormProps {
  ticketId: string;
  onCommentAdded?: () => void;
}

export function TicketCommentForm({ ticketId, onCommentAdded }: TicketCommentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const user = currentUser();
  const canAddInternal = user?.rol === 'agente' || user?.rol === 'supervisor';
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
      is_internal: false,
    },
  });

  const onSubmit = async (data: CommentFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const result = await addComment({
      ticket_id: ticketId,
      content: data.content,
      is_internal: data.is_internal,
    });
    
    if (result.success) {
      setSuccess(true);
      reset();
      onCommentAdded?.();
      // Reset success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setError(result.error || 'Error al agregar comentario');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Nuevo Comentario
        </label>
        <textarea
          id="content"
          {...register('content')}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Escribe tu comentario..."
          disabled={loading}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>
      
      {canAddInternal && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_internal"
            {...register('is_internal')}
            className="rounded border-gray-300"
            disabled={loading}
          />
          <label htmlFor="is_internal" className="text-sm text-gray-600">
            Comentario interno (solo visible para agentes y supervisores)
          </label>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {success && (
        <p className="text-green-600 text-sm">Comentario agregado correctamente</p>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        {loading ? 'Enviando...' : 'Agregar Comentario'}
      </button>
    </form>
  );
}