"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { searchTickets } from "@/actions/search-tickets";
import { TicketSearchBar } from "@/components/ticket-search-bar";
import { TicketFilterPanel } from "@/components/ticket-filter-panel";
import { TicketPagination } from "@/components/ticket-pagination";
import { SearchFilters } from "@/lib/search";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Search and filter state
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    per_page: 10,
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  });

  // Fetch tickets with search/filter
  const fetchTickets = useCallback(async (searchFilters: SearchFilters) => {
    setSearchLoading(true);
    try {
      const result = await searchTickets(searchFilters);
      if (result.success && result.result) {
        setTickets(result.result.tickets);
        setPagination({
          totalItems: result.result.totalItems,
          totalPages: result.result.totalPages,
          currentPage: result.result.currentPage,
        });
      }
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      // Try to get user from localStorage (basic auth persistence)
      const storedUser = localStorage.getItem("pb_auth");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData.model);
        } catch (e) {
          console.error("Failed to parse stored user:", e);
        }
      }
      
      // Fetch initial tickets
      await fetchTickets({ page: 1, per_page: 10 });
      setLoading(false);
    }

    init();
  }, [fetchTickets]);

  // Search handlers
  const handleSearch = useCallback((query: string) => {
    const newFilters = { ...filters, query, page: 1 };
    setFilters(newFilters);
    fetchTickets(newFilters);
  }, [filters, fetchTickets]);

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    fetchTickets(updated);
  }, [filters, fetchTickets]);

  const handlePageChange = useCallback((page: number) => {
    const updated = { ...filters, page };
    setFilters(updated);
    fetchTickets(updated);
  }, [filters, fetchTickets]);

  const priorityColors = {
    baja: "bg-green-100 text-green-800",
    media: "bg-yellow-100 text-yellow-800",
    alta: "bg-orange-100 text-orange-800",
    critica: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    nuevo: "Nuevo",
    en_proceso: "En Proceso",
    en_espera: "En Espera",
    resuelto: "Resuelto",
    reabierto: "Reabierto",
    cerrado: "Cerrado",
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!tickets || tickets.length === 0) {
    return <div>No hay tickets aún.</div>;
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Tickets</h1>
        <Link
          href="/tickets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuevo Ticket
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <TicketSearchBar onSearch={handleSearch} initialQuery={filters.query || ''} />
      </div>

      {/* Filter Panel */}
      <div className="mb-4">
        <TicketFilterPanel onFilterChange={handleFilterChange} initialFilters={filters} />
      </div>

      {/* Loading State */}
      {searchLoading && (
        <div className="text-center py-4 text-gray-500">Buscando tickets...</div>
      )}

      {/* No Results */}
      {!searchLoading && tickets.length === 0 && (
        <div className="text-center py-8 text-gray-500">No se encontraron tickets</div>
      )}

      {/* Results Table */}
      {!searchLoading && tickets.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {ticket.ticket_number}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <Link href={`/tickets/${ticket.id}`} className="hover:text-blue-600">
                    {ticket.titulo}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100">
                    {statusLabels[ticket.estado] || ticket.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[ticket.prioridad]}`}
                  >
                    {ticket.prioridad}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.created).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="p-4">
          <TicketPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}