'use client';

import { useState, useEffect, use } from 'react';
import PocketBase from 'pocketbase';
import Link from 'next/link';
import { TicketCommentForm } from '@/components/ticket-comment-form';
import { TicketCommentsList } from '@/components/ticket-comments-list';
import { TicketAttachmentUpload } from '@/components/ticket-attachment-upload';
import { TicketAttachmentsList } from '@/components/ticket-attachments-list';

const pb = new PocketBase('http://127.0.0.1:8090');

interface Ticket {
  id: string;
  ticket_number: string;
  titulo: string;
  descripcion: string;
  prioridad: string;
  categoria: string;
  estado: string;
  departamento: string;
  creado_por: string;
  asignado_a?: string;
  cerrado_en?: string;
  archivos?: string[];
  created: string;
  updated: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  rol: string;
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<User[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assignedUserName, setAssignedUserName] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem("pb_auth");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          pb.authStore.save(data.token, data.model);
          const userModel = data.model as User;
          setUser(userModel);
          
          const ticketData = await pb.collection('tickets').getOne<Ticket>(id);
          setTicket(ticketData);
          
          if (ticketData.asignado_a) {
            try {
              const assignedUser = await pb.collection('usuarios').getOne(ticketData.asignado_a);
              const fullName = `${assignedUser.first_name || ''} ${assignedUser.last_name || ''}`.trim();
              setAssignedUserName(fullName || assignedUser.email);
            } catch (e) {
              setAssignedUserName(ticketData.asignado_a);
            }
          }
          
          if (userModel.rol === 'supervisor') {
            const agentsList = await pb.collection('usuarios').getFullList<User>({
              filter: `rol = "agente"`,
            });
            setAgents(agentsList);
          }
        } catch (e: any) {
          console.error('Error loading ticket:', e.message);
        }
      }
      setLoading(false);
    }
    
    init();
  }, [id]);

  const handleTakeTicket = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await pb.collection('tickets').update(id, {
        asignado_a: user?.id,
        estado: 'en_proceso',
      });
      const updated = await pb.collection('tickets').getOne<Ticket>(id);
      setTicket(updated);
      setMessage({ type: 'success', text: 'Ticket asignado correctamente' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Error al tomar ticket' });
    }
    setActionLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await pb.collection('tickets').update(id, { estado: newStatus });
      const updated = await pb.collection('tickets').getOne<Ticket>(id);
      setTicket(updated);
      setMessage({ type: 'success', text: 'Estado actualizado' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Error al cambiar estado' });
    }
    setActionLoading(false);
  };

  const handleReassign = async (newAgentId: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await pb.collection('tickets').update(id, { asignado_a: newAgentId });
      const updated = await pb.collection('tickets').getOne<Ticket>(id);
      setTicket(updated);
      setMessage({ type: 'success', text: 'Ticket reasignado' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Error al reasignar' });
    }
    setActionLoading(false);
  };

  const handlePriorityChange = async (newPriority: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await pb.collection('tickets').update(id, { prioridad: newPriority });
      const updated = await pb.collection('tickets').getOne<Ticket>(id);
      setTicket(updated);
      setMessage({ type: 'success', text: 'Prioridad actualizada' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Error al cambiar prioridad' });
    }
    setActionLoading(false);
  };

  const isAgent = user?.rol === 'agente' || user?.rol === 'supervisor';
  const isSupervisor = user?.rol === 'supervisor';

  const validTransitions: Record<string, string[]> = {
    nuevo: ['en_proceso', 'cerrado'],
    en_proceso: ['en_espera', 'resuelto', 'cerrado'],
    en_espera: ['en_proceso', 'cerrado'],
    resuelto: ['reabierto', 'cerrado'],
    reabierto: ['en_proceso', 'cerrado'],
    cerrado: ['reabierto'],
  };

  const priorityColors: Record<string, string> = {
    baja: 'bg-green-100 text-green-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-orange-100 text-orange-800',
    critica: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    nuevo: 'Nuevo',
    en_proceso: 'En Proceso',
    en_espera: 'En Espera',
    resuelto: 'Resuelto',
    reabierto: 'Reabierto',
    cerrado: 'Cerrado',
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!ticket) {
    return <div className="p-8">Ticket no encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/dashboard/tickets" className="text-blue-600 hover:underline">
          ← Volver a Mis Tickets
        </Link>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{ticket.titulo}</h1>
            <p className="text-gray-500">{ticket.ticket_number}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.prioridad]}`}>
              {ticket.prioridad}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
              {statusLabels[ticket.estado]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-gray-500">Categoría:</span> {ticket.categoria}
          </div>
          <div>
            <span className="text-gray-500">Creado:</span> {new Date(ticket.created).toLocaleString()}
          </div>
          {ticket.asignado_a && (
            <div>
              <span className="text-gray-500">Asignado a:</span> {assignedUserName || ticket.asignado_a}
            </div>
          )}
        </div>

        {isAgent && !ticket.asignado_a && ticket.estado === 'nuevo' && (
          <div className="mb-4">
            <button
              onClick={handleTakeTicket}
              disabled={actionLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Tomando...' : 'Tomar Ticket'}
            </button>
          </div>
        )}

        {isAgent && ticket.asignado_a && (
          <div className="border-t pt-4 mb-4">
            <h2 className="font-semibold mb-3">Cambiar Estado</h2>
            <div className="flex flex-wrap gap-2">
              {validTransitions[ticket.estado]?.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={actionLoading}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        )}

        {isAgent && (
          <div className="border-t pt-4 mb-4">
            <h2 className="font-semibold mb-3">Cambiar Prioridad</h2>
            <div className="flex flex-wrap gap-2">
              {['baja', 'media', 'alta', 'critica'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  disabled={actionLoading || ticket.prioridad === priority}
                  className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 ${priorityColors[priority]}`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        )}

        {isSupervisor && (
          <div className="border-t pt-4 mb-4">
            <h2 className="font-semibold mb-3">Reasignar Ticket</h2>
            <select
              onChange={(e) => handleReassign(e.target.value)}
              disabled={actionLoading}
              value={ticket.asignado_a || ''}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Seleccionar agente...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.first_name} {agent.last_name} ({agent.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">Descripción</h2>
          <p className="whitespace-pre-wrap">{ticket.descripcion}</p>
        </div>

        {ticket.archivos && ticket.archivos.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <TicketAttachmentsList ticketId={id} files={ticket.archivos} />
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <h2 className="font-semibold mb-4">Comentarios</h2>
          <TicketCommentsList ticketId={id} userRole={user?.rol as any} />
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="font-semibold mb-4">Agregar Comentario</h2>
          <TicketCommentForm ticketId={id} userRole={user?.rol as any} />
        </div>

        {isAgent && (
          <div className="border-t pt-4 mt-4">
            <TicketAttachmentUpload 
              ticketId={id} 
              currentFiles={ticket.archivos || []} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
