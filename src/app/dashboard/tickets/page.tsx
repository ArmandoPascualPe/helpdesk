"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

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

interface Filters {
  search: string;
  estado: string;
  prioridad: string;
  categoria: string;
  fechaDesde: string;
  fechaHasta: string;
}

export default function TicketsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") || "",
    estado: searchParams.get("estado") || "",
    prioridad: searchParams.get("prioridad") || "",
    categoria: searchParams.get("categoria") || "",
    fechaDesde: searchParams.get("fechaDesde") || "",
    fechaHasta: searchParams.get("fechaHasta") || "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        
        if (userRol === "agente") {
          let filters: string[] = [];
          
          if (userDepto) {
            filters.push(`departamento='${userDepto}'`);
          }
          
          filters.push(`asignado_a='${userId}'`);
          filters.push(`creado_por='${userId}'`);
          
          const filter = filters.map(f => `(${f})`).join(' || ');
          
          const res = await fetch(`http://127.0.0.1:8090/api/collections/tickets/records?filter=${encodeURIComponent(filter)}&sort=-created`, {
            headers: { 'Authorization': token }
          });
          const data = await res.json();
          ticketList = data.items || [];
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
        
        const deptsRes = await fetch('http://127.0.0.1:8090/api/collections/departamentos/records');
        const deptsData = await deptsRes.json();
        const deptMap: Record<string, string> = {};
        (deptsData.items || []).forEach((d: any) => {
          deptMap[d.id] = d.nombre;
        });
        
        setAssignedUsers(usersMap);
        setAllTickets(ticketList);
        setLoading(false);
      };

      fetchData();
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && allTickets.length > 0) {
      const hasFilters = filters.search || filters.estado || filters.prioridad || filters.categoria || filters.fechaDesde || filters.fechaHasta;
      if (hasFilters) {
        applyFilters();
      } else {
        const start = (currentPage - 1) * itemsPerPage;
        const paginated = allTickets.slice(start, start + itemsPerPage);
        setTickets(paginated);
      }
    }
  }, [currentPage, allTickets, loading, filters]);

  const hasActiveFilters = () => filters.search || filters.estado || filters.prioridad || filters.categoria || filters.fechaDesde || filters.fechaHasta;

  const applyFilters = () => {
    let filtered = [...allTickets];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.titulo.toLowerCase().includes(searchLower) || 
        t.descripcion.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.estado) {
      filtered = filtered.filter(t => t.estado === filters.estado);
    }
    
    if (filters.prioridad) {
      filtered = filtered.filter(t => t.prioridad === filters.prioridad);
    }
    
    if (filters.categoria) {
      filtered = filtered.filter(t => t.categoria === filters.categoria);
    }
    
    if (filters.fechaDesde) {
      filtered = filtered.filter(t => new Date(t.created) >= new Date(filters.fechaDesde));
    }
    
    if (filters.fechaHasta) {
      filtered = filtered.filter(t => new Date(t.created) <= new Date(filters.fechaHasta));
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    setTickets(paginated);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    applyFilters();
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.estado) params.set("estado", filters.estado);
    if (filters.prioridad) params.set("prioridad", filters.prioridad);
    if (filters.categoria) params.set("categoria", filters.categoria);
    if (filters.fechaDesde) params.set("fechaDesde", filters.fechaDesde);
    if (filters.fechaHasta) params.set("fechaHasta", filters.fechaHasta);
    
    router.push(`/dashboard/tickets?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      estado: "",
      prioridad: "",
      categoria: "",
      fechaDesde: "",
      fechaHasta: "",
    });
    setCurrentPage(1);
    router.push("/dashboard/tickets");
    const start = (1 - 1) * itemsPerPage;
    const paginated = allTickets.slice(start, start + itemsPerPage);
    setTickets(paginated);
  };

  const totalFiltered = hasActiveFilters() ? allTickets.filter(t => {
    let match = true;
    if (filters.search && !t.titulo.toLowerCase().includes(filters.search.toLowerCase()) && 
        !t.descripcion.toLowerCase().includes(filters.search.toLowerCase())) match = false;
    if (filters.estado && t.estado !== filters.estado) match = false;
    if (filters.prioridad && t.prioridad !== filters.prioridad) match = false;
    if (filters.categoria && t.categoria !== filters.categoria) match = false;
    if (filters.fechaDesde && new Date(t.created) < new Date(filters.fechaDesde)) match = false;
    if (filters.fechaHasta && new Date(t.created) > new Date(filters.fechaHasta)) match = false;
    return match;
  }).length : allTickets.length;

  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

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

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {hasActiveFilters() && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">Activos</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar en título o descripción"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="nuevo">Nuevo</option>
                <option value="en_proceso">En Proceso</option>
                <option value="en_espera">En Espera</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prioridad</label>
              <select
                value={filters.prioridad}
                onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="red">Red</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron tickets con los filtros aplicados
        </div>
      ) : (
        <>
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

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalFiltered)} de {totalFiltered} tickets
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}