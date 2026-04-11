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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex flex-col items-start">
              <Link href="/dashboard/tickets" className="text-xl font-bold text-blue-600">
                Help Desk
              </Link>
              {userName && (
                <span className="text-sm text-gray-500">{userName} ({userRole})</span>
              )}
              <div className="ml-10 flex items-baseline space-x-4 mt-1">
                <Link href="/dashboard/tickets" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Mis Tickets
                </Link>
                <Link href="/dashboard/departments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Departamentos
                </Link>
                <Link href="/dashboard/supervisor" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
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