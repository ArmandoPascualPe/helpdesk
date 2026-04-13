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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--olive-medium)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando tickets...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'rgba(212, 196, 168, 0.3)', backgroundColor: 'rgba(254, 242, 242, 0.5)' }}>
        <p className="text-red-600">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-semibold text-[var(--olive-deep)]" style={{ fontFamily: "var(--font-cormorant)" }}>
            Mis Tickets
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Gestiona y sigue tus solicitudes de soporte</p>
        </div>
        <Link href="/dashboard/tickets/new" className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg bg-[var(--olive-dark)] text-[var(--beige-light)] hover:bg-[var(--olive-deep)]">
          Nuevo Ticket
        </Link>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all duration-300 hover:border-[var(--olive-medium)]"
          style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-secondary)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm">Filtros</span>
          {hasActiveFilters() && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--olive-medium)] text-[var(--beige-light)]">Activos</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-2xl p-6 mb-6 border" style={{ backgroundColor: 'rgba(253, 252, 249, 0.8)', borderColor: 'rgba(212, 196, 168, 0.3)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Buscar</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar en título o descripción"
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
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
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Prioridad</label>
              <select
                value={filters.prioridad}
                onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Categoría</label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              >
                <option value="">Todas</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="red">Red</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Fecha Desde</label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Fecha Hasta</label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleApplyFilters}
              className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg bg-[var(--olive-dark)] text-[var(--beige-light)] hover:bg-[var(--olive-deep)]"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 border hover:border-[var(--olive-medium)]"
              style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-secondary)' }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'rgba(212, 196, 168, 0.2)', color: 'var(--text-muted)' }}>
          No se encontraron tickets con los filtros aplicados
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(212, 196, 168, 0.5)', backgroundColor: '#FDFCF9' }}>
            <table className="min-w-full rounded-lg overflow-hidden">
              <thead>
                <tr className="rounded-lg" style={{ backgroundColor: '#E8DFD0' }}>
                  <th className="px-6 py-4 text-left text-sm uppercase tracking-widest rounded-tl-lg" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Título</th>
                  <th className="px-6 py-4 text-left text-sm uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Descripción</th>
                  <th className="px-6 py-4 text-left text-sm uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Prioridad</th>
                  <th className="px-6 py-4 text-left text-sm uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Categoría</th>
                  <th className="px-6 py-4 text-left text-sm uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Estado</th>
                  <th className="px-6 py-4 text-left text-sm uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Asignado a</th>
                  <th className="px-6 py-4 text-left text-sm uppercase tracking-widest rounded-tr-lg" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Fecha</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--card-bg)' }}>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t transition-all duration-300 hover:bg-[var(--beige-light)]" style={{ borderColor: 'rgba(212, 196, 168, 0.2)' }}>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/tickets/${ticket.id}`} className="text-sm font-medium transition-colors hover:text-[var(--olive-medium)]" style={{ color: 'var(--text-primary)' }}>
                        {ticket.titulo}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {ticket.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        ticket.estado === 'nuevo' ? 'bg-blue-100 text-blue-800' :
                        ticket.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.estado === 'en_espera' ? 'bg-orange-100 text-orange-800' :
                        ticket.estado === 'resuelto' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-muted)' }}>
                      {ticket.asignado_a ? (assignedUsers[ticket.asignado_a] || ticket.asignado_a) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(ticket.created).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalFiltered)} de {totalFiltered} tickets
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-xl text-sm transition-all duration-300 hover:border-[var(--olive-medium)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-secondary)' }}
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Página {currentPage} de {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 border rounded-xl text-sm transition-all duration-300 hover:border-[var(--olive-medium)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)', color: 'var(--text-secondary)' }}
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