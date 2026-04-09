import { z } from 'zod';

/**
 * Search filters interface (D-10, D-11, D-12, D-13).
 */
export interface SearchFilters {
  query?: string;           // Text search
  status?: string;          // Filter by status
  priority?: string;       // Filter by priority
  category?: string;        // Filter by category
  date_from?: string;       // ISO date string
  date_to?: string;        // ISO date string
  page?: number;            // Default 1
  per_page?: number;        // Default 10 (D-12)
}

export interface SearchResult {
  tickets: any[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['nuevo', 'en_proceso', 'resuelto', 'cerrado', 'en_espera', 'reabierto']).optional(),
  priority: z.enum(['baja', 'media', 'alta', 'critica']).optional(),
  category: z.enum(['hardware', 'software', 'red', 'otros']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(50).default(10),
});

export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;

/**
 * Build PocketBase filter string from SearchFilters.
 * Combines query with LIKE on title OR description (D-10).
 * Adds all filters (D-11).
 * Uses && to combine all filters (D-13).
 */
export function buildPocketBaseFilter(filters: SearchFilters): string {
  const conditions: string[] = [];
  
  // Text search on title and description (D-10)
  if (filters.query && filters.query.trim().length > 0) {
    const query = filters.query.trim().replace(/["\\]/g, '\\\\$&');
    conditions.push(`(titulo ~ "${query}" || descripcion ~ "${query}")`);
  }
  
  // Status filter (D-11)
  if (filters.status) {
    conditions.push(`estado = "${filters.status}"`);
  }
  
  // Priority filter (D-11)
  if (filters.priority) {
    conditions.push(`prioridad = "${filters.priority}"`);
  }
  
  // Category filter (D-11)
  if (filters.category) {
    conditions.push(`categoria = "${filters.category}"`);
  }
  
  // Date from filter (D-11)
  if (filters.date_from) {
    conditions.push(`created >= "${filters.date_from}"`);
  }
  
  // Date to filter (D-11)
  if (filters.date_to) {
    conditions.push(`created <= "${filters.date_to}"`);
  }
  
  // Combine all conditions with AND (D-13)
  if (conditions.length === 0) {
    return '';
  }
  
  return conditions.join(' && ');
}

/**
 * Calculate pagination metadata.
 */
export function calculatePagination(
  totalItems: number,
  currentPage: number,
  perPage: number
): { totalPages: number; startItem: number; endItem: number } {
  const totalPages = Math.ceil(totalItems / perPage);
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);
  
  return { totalPages, startItem, endItem };
}