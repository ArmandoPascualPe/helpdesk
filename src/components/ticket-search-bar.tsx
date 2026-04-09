'use client';

import { useState, useEffect, useCallback } from 'react';

interface TicketSearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function TicketSearchBar({ onSearch, initialQuery = '' }: TicketSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Debounced search (300ms as per D-10)
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout for debounce
    const timeout = setTimeout(() => {
      onSearch(value);
    }, 300);
    
    setDebounceTimeout(timeout);
  }, [debounceTimeout, onSearch]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediate search on button click
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Buscar tickets..."
        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
      >
        Buscar
      </button>
    </form>
  );
}