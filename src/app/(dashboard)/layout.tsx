"use client";

import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pb_auth");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        pb.authStore.save(data.token, data.model);
        setUser(data.model);
      } catch (e) {
        console.error("Failed to load auth:", e);
      }
    }
  }, []);

  if (!user) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Help Desk</h1>
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/tickets" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Mis Tickets
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">{user.nombre || user.email}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-4">{user.rol}</span>
              <Link href="/logout" className="text-sm text-red-600 hover:text-red-800">
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
