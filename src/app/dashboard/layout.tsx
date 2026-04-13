"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("pb_auth");
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        const user = authData.model;
        if (user) {
          setUserName(`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || user.email);
          const roleMap: Record<string, string> = {
            cliente: "Cliente",
            agente: "Agente",
            supervisor: "Supervisor"
          };
          setUserRole(roleMap[user.rol] || user.rol);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--beige-light)' }}>
      <nav className="shadow-lg" style={{ backgroundColor: 'var(--wood-dark)', boxShadow: '0 4px 20px rgba(46, 39, 35, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-16">
            <div className="flex flex-col items-start justify-center">
              <Link href="/dashboard/tickets" className="text-2xl font-semibold transition-all duration-300 hover:text-[var(--gold-light)]" style={{ fontFamily: "var(--font-cormorant)", color: 'var(--beige-light)' }}>
                Help Desk
              </Link>
              {userName && (
                <span className="text-sm mt-0.5 opacity-80" style={{ color: 'var(--beige-medium)' }}>{userName} • {userRole}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Link href="/dashboard/tickets" className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10" style={{ color: 'var(--beige-light)' }}>
                Mis Tickets
              </Link>
              <Link href="/dashboard/departments" className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10" style={{ color: 'var(--beige-light)' }}>
                Departamentos
              </Link>
              <Link href="/dashboard/supervisor" className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10" style={{ color: 'var(--beige-light)' }}>
                Dashboard
              </Link>
              <Link href="/logout" className="ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-red-900/30" style={{ color: '#EF9A9A' }}>
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8 px-6">
        {children}
      </main>
    </div>
  );
}