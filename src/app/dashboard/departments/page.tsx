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
    return <div className="p-8">Cargando...</div>;
  }

  if (!user) {
    return <div className="p-8">No autorizado</div>;
  }

  if (user.rol !== 'supervisor') {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          Solo supervisores pueden acceder a esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Departamentos</h1>
      <DepartmentList userRole={user.rol as 'cliente' | 'agente' | 'supervisor'} />
    </div>
  );
}