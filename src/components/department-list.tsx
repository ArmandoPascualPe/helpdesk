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
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--olive-medium)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p style={{ color: 'var(--text-muted)' }}>Cargando departamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSupervisor && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg bg-[var(--olive-dark)] text-[var(--beige-light)] hover:bg-[var(--olive-deep)]"
          >
            {showForm ? 'Cancelar' : 'Nuevo Departamento'}
          </button>
        </div>
      )}

      {showForm && (
        <form action={handleCreate} className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(46, 58, 32, 0.06)', borderColor: 'rgba(212, 196, 168, 0.3)' }}>
          <h3 className="text-xl font-medium mb-5" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--olive-deep)' }}>Crear Departamento</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Nombre</label>
              <input
                name="nombre"
                required
                minLength={3}
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Descripción</label>
              <textarea
                name="descripcion"
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input
                name="email"
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
              />
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 bg-[var(--olive-dark)] text-[var(--beige-light)] hover:bg-[var(--olive-deep)]">
              Crear
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FEE2E2' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #DCFCE7' }}>
          {success}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(212, 196, 168, 0.5)', backgroundColor: '#FDFCF9' }}>
        <table className="min-w-full rounded-lg overflow-hidden">
          <thead>
            <tr className="rounded-lg" style={{ backgroundColor: '#E8DFD0' }}>
              <th className="px-6 py-4 text-left text-sm uppercase tracking-widest rounded-l-lg" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Nombre</th>
              <th className="px-6 py-4 text-left text-sm uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Descripción</th>
              <th className="px-6 py-4 text-left text-sm uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Estado</th>
              <th className="px-6 py-4 text-left text-sm uppercase tracking-widest rounded-r-lg" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--card-bg)' }}>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No hay departamentos
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="border-t transition-all duration-300 hover:bg-[var(--beige-light)]" style={{ borderColor: 'rgba(212, 196, 168, 0.2)' }}>
                  <td className="px-6 py-4">
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
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{dept.nombre}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{dept.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
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
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setEditingId(dept.id)}
                          className="transition-colors hover:text-[var(--olive-medium)]"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => dept.activo ? handleDeactivate(dept.id) : handleActivate(dept.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            dept.activo ? 'bg-[var(--olive-medium)]' : 'bg-gray-300'
                          }`}
                          style={{ width: '44px' }}
                          title={dept.activo ? 'Desactivar' : 'Activar'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              dept.activo ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleViewAgents(dept.id)}
                          className="text-sm font-medium transition-colors hover:text-[var(--olive-medium)]"
                          style={{ color: 'var(--text-secondary)' }}
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
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(46, 58, 32, 0.06)', borderColor: 'rgba(212, 196, 168, 0.3)' }}>
          <h3 className="text-xl font-medium mb-5" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--olive-deep)' }}>Agentes en el Departamento</h3>
          
          <div className="mb-5">
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Asignar agente</label>
            <div className="flex gap-3">
              <select
                id="agentSelect"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all duration-300"
                style={{ borderColor: 'rgba(212, 196, 168, 0.5)' }}
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
                className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 bg-[var(--olive-dark)] text-[var(--beige-light)] hover:bg-[var(--olive-deep)]"
              >
                Asignar
              </button>
            </div>
          </div>

          <table className="min-w-full rounded-lg overflow-hidden">
            <thead>
              <tr className="rounded-lg" style={{ backgroundColor: '#E8DFD0' }}>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest rounded-l-lg" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Nombre</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Rol</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest rounded-r-lg" style={{ color: 'var(--olive-deep)', fontFamily: 'var(--font-cormorant)' }}>Acción</th>
              </tr>
            </thead>
<tbody style={{ backgroundColor: '#FAF8F3' }}>
              {agentsInDept.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No hay agentes asignados
                  </td>
                </tr>
              ) : (
                agentsInDept.map((agent) => (
                  <tr key={agent.id} className="border-t transition-all duration-300" style={{ borderColor: 'rgba(212, 196, 168, 0.2)' }}>
                    <td className="px-4 py-3 text-sm">{agent.first_name} {agent.last_name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{agent.rol}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnassign(agent.id)}
                        className="text-sm transition-colors hover:text-red-600"
                        style={{ color: 'var(--olive-medium)' }}
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