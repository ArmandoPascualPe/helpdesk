"use client";

import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/tickets" className="text-xl font-bold text-blue-600">
                Help Desk
              </Link>
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/dashboard/tickets" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Mis Tickets
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