import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader?.startsWith("pb_auth ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("pb_auth ", "");
    
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    pb.authStore.save(token, decoded);

    if (!pb.authStore.isValid) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const userRecord = await pb.collection("usuarios").getOne(decoded.id);
    const userRole = userRecord.rol;

    if (userRole !== "supervisor") {
      return NextResponse.json({ error: "Solo supervisores pueden ejecutar esta acción" }, { status: 403 });
    }

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const allTickets = await pb.collection("tickets").getFullList();

    const ticketsToClose = allTickets.filter((t: any) => {
      if (t.estado !== "resuelto") return false;
      const updatedDate = new Date(t.updated);
      return updatedDate < fortyEightHoursAgo;
    });

    let closedCount = 0;
    for (const ticket of ticketsToClose) {
      try {
        await pb.collection("tickets").update(ticket.id, {
          estado: "cerrado",
          cerrado_en: now.toISOString(),
        });

        await pb.collection("comentarios").create({
          ticket: ticket.id,
          contenido: "Cerrado por sistema: Ticket resuelto hace más de 48 horas sin objeción del cliente.",
          es_interno: true,
          autor: decoded.id,
        });

        closedCount++;
      } catch (e) {
        console.error(`Error closing ticket ${ticket.id}:`, e);
      }
    }

    return NextResponse.json({
      message: `Se cerraron ${closedCount} tickets`,
      closedCount,
    });
  } catch (error) {
    console.error("Error in auto-close:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}