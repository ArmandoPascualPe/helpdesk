'use server';

import { pb } from '@/lib/pocketbase';
import { currentUser } from '@/lib/auth';
import { 
  SearchFilters, 
  SearchResult, 
  searchFiltersSchema, 
  buildPocketBaseFilter,
  calculatePagination 
} from '@/lib/search';
import { z } from 'zod';

/**
 * Server Action to search tickets with filters.
 * Applies role-based access control (D-13).
 */
export async function searchTickets(
  filters: SearchFilters
): Promise<{ success: boolean; result?: SearchResult; error?: string }> {
  try {
    // Validate input
    const validated = searchFiltersSchema.parse(filters);
    
    // Get current user for role-based filtering
    const user = currentUser();
    if (!user) {
      return { success: false, error: 'Debe iniciar sesión' };
    }
    
    // Set defaults
    const page = validated.page || 1;
    const perPage = validated.per_page || 10;
    
    // Build base filter
    let baseFilter = buildPocketBaseFilter(validated);
    
    // Apply role-based access control
    if (user.rol === 'cliente') {
      // Cliente can only see their own tickets
      const userFilter = baseFilter 
        ? `creado_por = "${user.id}" && (${baseFilter})`
        : `creado_por = "${user.id}"`;
      baseFilter = userFilter;
    } else if (user.rol === 'agente') {
      // Agente can only see tickets from their department
      const userFilter = baseFilter 
        ? `departamento = "${user.departamento}" && (${baseFilter})`
        : `departamento = "${user.departamento}"`;
      baseFilter = userFilter;
    }
    // Supervisor can see all tickets (no additional filter)
    
    // Execute search
    const result = await pb.collection('tickets').getList(page, perPage, {
      filter: baseFilter,
      sort: '-created',
    });
    
    // Calculate pagination
    const pagination = calculatePagination(result.totalItems, page, perPage);
    
    const searchResult: SearchResult = {
      tickets: result.items,
      totalItems: result.totalItems,
      totalPages: pagination.totalPages,
      currentPage: page,
    };
    
    return { success: true, result: searchResult };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Error searching tickets:', error);
    return { success: false, error: 'Error al buscar tickets' };
  }
}

/**
 * Helper to get initial tickets for a user (page 1).
 */
export async function getInitialTickets(): Promise<{ success: boolean; result?: SearchResult; error?: string }> {
  return searchTickets({ page: 1, per_page: 10 });
}