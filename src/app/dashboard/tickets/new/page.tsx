"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { pb } from "@/lib/pocketbase";

const ticketSchema = z.object({
  titulo: z.string().min(5, "Título debe tener al menos 5 caracteres").max(200),
  descripcion: z.string().min(10, "Descripción debe tener al menos 10 caracteres"),
  prioridad: z.enum(["baja", "media", "alta", "critica"]),
  categoria: z.enum(["hardware", "software", "red", "otros"]),
  departamento: z.string().min(1, "Selecciona un departamento"),
});

type TicketInput = z.infer<typeof ticketSchema>;

export default function NewTicketPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
  });

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('http://127.0.0.1:8090/api/collections/departamentos/records');
        const data = await res.json();
        setDepartments(data.items || []);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    }
    fetchDepartments();
  }, []);

  const onSubmit = async (data: TicketInput) => {
    setError("");
    setLoading(true);

    try {
      const user = pb.authStore.model;
      const year = new Date().getFullYear();
      
      const countRes = await fetch(`http://127.0.0.1:8090/api/collections/tickets/records?filter=ticket_number~"TKT-${year}-"&page=1&perPage=1`);
      const countData = await countRes.json();
      const nextNum = (countData.totalItems || 0) + 1;
      const ticketNumber = `TKT-${year}-${String(nextNum).padStart(5, '0')}`;

      const ticketData = {
        ...data,
        ticket_number: ticketNumber,
        estado: 'nuevo',
        creado_por: user?.id,
      };

      await pb.collection('tickets').create(ticketData);
      router.push('/dashboard/tickets');
    } catch (err: any) {
      setError(err.message || "Error al crear ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Ticket</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            {...register("titulo")}
            className="w-full border rounded px-3 py-2"
            placeholder="Título del ticket"
          />
          {errors.titulo && <p className="text-red-500 text-xs">{errors.titulo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            {...register("descripcion")}
            className="w-full border rounded px-3 py-2 h-32"
            placeholder="Describe tu problema"
          />
          {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prioridad</label>
            <select {...register("prioridad")} className="w-full border rounded px-3 py-2">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select {...register("categoria")} className="w-full border rounded px-3 py-2">
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="red">Red</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Departamento</label>
          <select {...register("departamento")} className="w-full border rounded px-3 py-2">
            <option value="">Selecciona departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.nombre}</option>
            ))}
          </select>
          {errors.departamento && <p className="text-red-500 text-xs">{errors.departamento.message}</p>}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Creando..." : "Crear Ticket"}
          </button>
          <a href="/dashboard/tickets" className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
