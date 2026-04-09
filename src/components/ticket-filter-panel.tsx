'use client';

import { SearchFilters } from '@/lib/search';

interface TicketFilterPanelProps {
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  initialFilters?: Partial<SearchFilters>;
}

const STATUS_OPTIONS = ['nuevo', 'en_proceso', 'resuelto', 'cerrado', 'en_espera', 'reabierto'];
const PRIORITY_OPTIONS = ['baja', 'media', 'alta', 'critica'];
const CATEGORY_OPTIONS = ['hardware', 'software', 'red', 'otros'];

const STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
  en_espera: 'En Espera',
  reabierto: 'Reabierto',
};

const PRIORITY_LABELS: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

const CATEGORY_LABELS: Record<string, string> = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red',
  otros: 'Otros',
};

export function TicketFilterPanel({ onFilterChange, initialFilters = {} }: TicketFilterPanelProps) {
  const [status, setStatus] = useState(initialFilters.status || '');
  const [priority, setPriority] = useState(initialFilters.priority || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
  const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
  
  const updateFilters = (
    newStatus?: string,
    newPriority?: string,
    newCategory?: string,
    newDateFrom?: string,
    newDateTo?: string
  ) => {
    const filters: Partial<SearchFilters> = {};
    
    if (newStatus !== undefined) {
      filters.status = newStatus || undefined;
    }
    if (newPriority !== undefined) {
      filters.priority = newPriority || undefined;
    }
    if (newCategory !== undefined) {
      filters.category = newCategory || undefined;
    }
    if (newDateFrom !== undefined) {
      filters.date_from = newDateFrom || undefined;
    }
    if (newDateTo !== undefined) {
      filters.date_to = newDateTo || undefined;
    }
    
    onFilterChange(filters);
  };
  
  const handleClearFilters = () => {
    setStatus('');
    setPriority('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
    onFilterChange({});
  };
  
  const hasFilters = status || priority || category || dateFrom || dateTo;

  return (
    <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              updateFilters(e.target.value, undefined, undefined, undefined, undefined);
            }}
            className="w-full border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{STATUS_LABELS[opt]}</option>
            ))}
          </select>
        </div>
        
        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              updateFilters(undefined, e.target.value, undefined, undefined, undefined);
            }}
            className="w-full border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{PRIORITY_LABELS[opt]}</option>
            ))}
          </select>
        </div>
        
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              updateFilters(undefined, undefined, e.target.value, undefined, undefined);
            }}
            className="w-full border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{CATEGORY_LABELS[opt]}</option>
            ))}
          </select>
        </div>
        
        {/* Date From */}
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              updateFilters(undefined, undefined, undefined, e.target.value, undefined);
            }}
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Date To */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              updateFilters(undefined, undefined, undefined, undefined, e.target.value);
            }}
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
        </div>
        
        {/* Clear Filters Button */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-red-600 hover:text-red-800 text-sm mt-6"
          >
            Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  );
}