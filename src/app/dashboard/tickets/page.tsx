"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoria: string;
  created: string;
  creado_por: string;
  departamento: string;
  asignado_a?: string;
}

interface User {
  id: string;
  rol: string;
  departamento?: string;
}

interface Department {
  id: string;
  nombre: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("pb_auth");
    if (!stored) {
      setError("No hay sesión - hacé login primero");
      setLoading(false);
      return;
    }
    
    try {
      const authData = JSON.parse(stored);
      const token = authData.token;
      const user: User = authData.model;
      const userId = user?.id;
      const userRol = user?.rol;
      const userDepto = user?.departamento;
      
      if (!token || !userId) {
        setError("Token inválido");
        setLoading(false);
        return;
      }

      const fetchData = async () => {
        let ticketList: Ticket[] = [];
        
        if (userRol === "agente" && userDepto) {
          const deptsRes = await fetch('http://127.0.0.1:8090/api/collections/departamentos/records');
          const deptsData = await deptsRes.json();
          const depts: Department[] = deptsData.items || [];
          const dept = depts.find(d => d.nombre === userDepto);
          
          if (dept) {
            const filter = `departamento='${dept.id}'`;
            const res = await fetch(`http://127.0.0.1:8090/api/collections/tickets/records?filter=${encodeURIComponent(filter)}&sort=-created`, {
              headers: { 'Authorization': token }
            });
            const data = await res.json();
            ticketList = data.items || [];
          }
        } else {
          let filter = "";
          if (userRol === "cliente") {
            filter = `creado_por='${userId}'`;
          }
          
          const url = filter 
            ? `http://127.0.0.1:8090/api/collections/tickets/records?filter=${encodeURIComponent(filter)}&sort=-created`
            : `http://127.0.0.1:8090/api/collections/tickets/records?sort=-created`;

          const res = await fetch(url, { headers: { 'Authorization': token } });
          const data = await res.json();
          ticketList = data.items || [];
        }
        
        const assignedIds = [...new Set(ticketList.filter(t => t.asignado_a).map(t => t.asignado_a))];
        const usersMap: Record<string, string> = {};
        
        for (const uid of assignedIds) {
          try {
            const userRes = await fetch(`http://127.0.0.1:8090/api/collections/usuarios/records/${uid}`, {
              headers: { 'Authorization': token }
            });
            const userData = await userRes.json();
            usersMap[uid] = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
          } catch (e) {
            usersMap[uid] = uid;
          }
        }
        setAssignedUsers(usersMap);
        setTickets(ticketList);
        setLoading(false);
      };

      fetchData();
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Tickets</h1>
        <Link href="/dashboard/tickets/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Nuevo Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tienes tickets todavía
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignado a</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:text-blue-600">
                      {ticket.titulo}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {ticket.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${
                      ticket.prioridad === 'critica' ? 'text-red-600' :
                      ticket.prioridad === 'alta' ? 'text-orange-600' :
                      ticket.prioridad === 'media' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ticket.estado === 'nuevo' ? 'bg-blue-100 text-blue-800' :
                      ticket.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.estado === 'resuelto' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.asignado_a ? (assignedUsers[ticket.asignado_a] || ticket.asignado_a) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.created).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}