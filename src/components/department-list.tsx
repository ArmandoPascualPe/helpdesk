'use client';

import { useEffect, useState } from 'react';
import { Department, Agent, getDepartments, getAgentsByDepartment, getAvailableAgents, hasOpenTickets } from '@/lib/departments';
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  deactivateDepartmentAction,
  activateDepartmentAction,
  getAgentsByDepartmentAction,
  getAvailableAgentsAction,
  assignAgentAction,
} from '@/actions/departments';

interface UserRole {
  rol: 'cliente' | 'agente' | 'supervisor';
}

export function DepartmentList({ userRole }: { userRole: UserRole['rol'] }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [agentsInDept, setAgentsInDept] = useState<Agent[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSupervisor = userRole === 'supervisor';

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    setLoading(true);
    const result = await getDepartmentsAction(true);
    if (result.success) {
      setDepartments(result.departments);
    }
    setLoading(false);
  }

  async function handleCreate(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await createDepartmentAction(formData);
    if (result.success) {
      setSuccess('Departamento creado');
      setShowForm(false);
      loadDepartments();
    } else {
      setError(result.error || 'Error');
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await updateDepartmentAction(id, formData);
    if (result.success) {
      setSuccess('Departamento actualizado');
      setEditingId(null);
      loadDepartments();
    } else {
      setError(result.error || 'Error');
    }
  }

  async function handleDeactivate(id: string) {
    setError(null);
    const hasOpen = await hasOpenTickets(id);
    if (hasOpen) {
      setError('No se puede desactivar: hay tickets abiertos');
      return;
    }
    const result = await deactivateDepartmentAction(id);
    if (result.success) {
      loadDepartments();
    } else {
      setError(result.error || 'Error');
    }
  }

  async function handleActivate(id: string) {
    setError(null);
    const result = await activateDepartmentAction(id);
    if (result.success) {
      loadDepartments();
    } else {
      setError(result.error || 'Error');
    }
  }

  async function handleViewAgents(deptId: string) {
    if (selectedDept === deptId) {
      setSelectedDept(null);
      setAgentsInDept([]);
      return;
    }
    setSelectedDept(deptId);
    const result = await getAgentsByDepartmentAction(deptId);
    if (result.success) {
      setAgentsInDept(result.agents);
    }
    const availResult = await getAvailableAgentsAction();
    console.log('getAvailableAgentsAction result:', availResult);
    if (availResult.success) {
      console.log('availableAgents set:', availResult.agents);
      setAvailableAgents(availResult.agents);
    }
  }

  async function handleAssign(agentId: string, departmentId: string) {
    setError(null);
    const result = await assignAgentAction(agentId, departmentId);
    if (result.success) {
      const deptResult = await getAgentsByDepartmentAction(departmentId);
      if (deptResult.success) {
        setAgentsInDept(deptResult.agents);
      }
      const availResult = await getAvailableAgentsAction();
      if (availResult.success) {
        setAvailableAgents(availResult.agents);
      }
    } else {
      setError(result.error || 'Error');
    }
  }

  async function handleUnassign(agentId: string) {
    setError(null);
    const result = await assignAgentAction(agentId, null);
    if (result.success) {
      const deptResult = await getAgentsByDepartmentAction(selectedDept!);
      if (deptResult.success) {
        setAgentsInDept(deptResult.agents);
      }
      const availResult = await getAvailableAgentsAction();
      if (availResult.success) {
        setAvailableAgents(availResult.agents);
      }
    } else {
      setError(result.error || 'Error');
    }
  }

  if (loading) {
    return <div className="text-gray-500">Cargando departamentos...</div>;
  }

  return (
    <div className="space-y-6">
      {isSupervisor && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : 'Nuevo Departamento'}
          </button>
        </div>
      )}

      {showForm && (
        <form action={handleCreate} className="bg-white p-6 rounded-lg shadow border space-y-4">
          <h3 className="text-lg font-medium">Crear Departamento</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              name="nombre"
              required
              minLength={3}
              maxLength={50}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              maxLength={500}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2"
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Crear
          </button>
        </form>
      )}

      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded">{success}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No hay departamentos
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === dept.id ? (
                      <form
                        action={(formData) => handleUpdate(dept.id, formData)}
                        className="flex gap-2"
                      >
                        <input
                          name="nombre"
                          defaultValue={dept.nombre}
                          required
                          minLength={3}
                          maxLength={50}
                          className="border px-2 py-1 rounded"
                        />
                        <input
                          name="descripcion"
                          defaultValue={dept.descripcion}
                          maxLength={500}
                          className="border px-2 py-1 rounded w-48"
                        />
                        <input
                          name="email"
                          defaultValue={dept.email}
                          className="border px-2 py-1 rounded"
                        />
                        <button type="submit" className="text-green-600">
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-gray-500"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{dept.nombre}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{dept.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        dept.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dept.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isSupervisor && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(dept.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                        {dept.activo ? (
                          <button
                            onClick={() => handleDeactivate(dept.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(dept.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Activar
                          </button>
                        )}
                        <button
                          onClick={() => handleViewAgents(dept.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Agentes
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedDept && isSupervisor && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">Agentes en el Departamento</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Asignar agente</label>
            <div className="flex gap-2">
              <select
                id="agentSelect"
                className="border rounded px-3 py-2"
              >
                <option value="">Seleccionar agente...</option>
                {availableAgents
                  .filter((a) => !a.departamento)
                  .map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.email || agent.username || agent.id}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => {
                  const select = document.getElementById('agentSelect') as HTMLSelectElement;
                  if (select.value) {
                    handleAssign(select.value, selectedDept);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Asignar
              </button>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rol</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agentsInDept.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                    No hay agentes asignados
                  </td>
                </tr>
              ) : (
                agentsInDept.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-4 py-2">{agent.first_name} {agent.last_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{agent.rol}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleUnassign(agent.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Desasignar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}