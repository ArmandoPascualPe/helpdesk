'use client';

import { useEffect, useState } from 'react';
import { DepartmentList } from '@/components/department-list';

interface User {
  rol: string;
}

export default function DepartmentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('pb_auth');
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        setUser(authData.model);
      } catch (e) {
        console.error('Error parsing auth:', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--olive-medium)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(254, 242, 242, 0.5)', color: '#B91C1C' }}>
          No autorizado
        </div>
      </div>
    );
  }

  if (user.rol !== 'supervisor') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(254, 242, 242, 0.5)', color: '#B91C1C' }}>
          Solo supervisores pueden acceder a esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-semibold mb-8" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--olive-deep)' }}>
        Gestión de Departamentos
      </h1>
      <DepartmentList userRole={user.rol as 'cliente' | 'agente' | 'supervisor'} />
    </div>
  );
}