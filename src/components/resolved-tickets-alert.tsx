"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

interface Ticket {
  id: string;
  ticket_number: string;
  titulo: string;
  updated: string;
}

interface ResolvedTicketsAlertProps {
  userRole?: string;
}

export function ResolvedTicketsAlert({ userRole }: ResolvedTicketsAlertProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userRole || userRole === "cliente") {
      setLoading(false);
      return;
    }
    // Wait a bit for auth to be ready
    const timer = setTimeout(() => {
      checkResolvedTickets();
    }, 100);
    return () => clearTimeout(timer);
  }, [userRole]);

  async function checkResolvedTickets() {
    try {
      const stored = localStorage.getItem("pb_auth");
      if (!stored) {
        setLoading(false);
        return;
      }
      
      const authData = JSON.parse(stored);
      if (!authData.token) {
        setLoading(false);
        return;
      }
      
      pb.authStore.save(authData.token, authData.model);

      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const allTickets = await pb.collection("tickets").getFullList();

      const resolved = allTickets.filter((t: any) => {
        if (t.estado !== "resuelto") return false;
        const updatedDate = new Date(t.updated);
        return updatedDate < fortyEightHoursAgo;
      });

      const ticketsList: Ticket[] = resolved.map((t: any) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        titulo: t.titulo,
        updated: t.updated,
      }));

      setTickets(ticketsList);
    } catch (error) {
      console.error("Error checking resolved tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || tickets.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      {!showList ? (
        <button
          onClick={() => setShowList(true)}
          className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border animate-pulse cursor-pointer"
          style={{ backgroundColor: "var(--gold)", borderColor: "var(--wood-dark)" }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-left">
            <p className="font-medium text-sm" style={{ color: "var(--wood-dark)" }}>
              Tickets resueltos pendientes de cierre
            </p>
            <p className="text-xs" style={{ color: "var(--wood-medium)" }}>
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} menunggu más de 48h
            </p>
          </div>
        </button>
      ) : (
        <div
          className="rounded-xl shadow-lg border overflow-hidden"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--beige-dark)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ backgroundColor: "var(--gold)", borderColor: "var(--beige-dark)" }}
          >
            <p className="font-medium text-sm" style={{ color: "var(--wood-dark)" }}>
              Tickets resueltos pendientes de cierre
            </p>
            <button
              onClick={() => setShowList(false)}
              className="p-1 hover:opacity-70"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {tickets.map((ticket) => {
              const updatedDate = new Date(ticket.updated);
              const hoursAgo = Math.round(
                (new Date().getTime() - updatedDate.getTime()) / (1000 * 60 * 60)
              );
              return (
                <a
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="block px-4 py-3 border-b hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--beige-light)" }}
                >
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {ticket.ticket_number}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                    {ticket.titulo}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Resuelto hace {hoursAgo}h
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}