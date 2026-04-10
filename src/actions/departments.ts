'use server';

import { pb } from '@/lib/pocketbase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  getDepartments,
  getDepartmentById,
  createDepartment as createDept,
  updateDepartment as updateDept,
  deactivateDepartment as deactivateDept,
  activateDepartment as activateDept,
  getAgentsByDepartment,
  getAvailableAgents,
  assignAgentToDepartment,
} from '@/lib/departments';

async function loadAuth() {
  'use server';
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth')?.value;
  
  if (authCookie) {
    try {
      const authData = JSON.parse(decodeURIComponent(authCookie));
      pb.authStore.save(authData.token, authData.model);
    } catch (e) {
      console.error('Failed to load auth:', e);
    }
  }
}

function checkSupervisor(): boolean {
  if (!pb.authStore.isValid || !pb.authStore.model) return false;
  const user = pb.authStore.model as any;
  return user.rol === 'supervisor';
}

export async function getDepartmentsAction(includeInactive = false) {
  await loadAuth();
  
  if (!pb.authStore.isValid) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const departments = await getDepartments(includeInactive);
    return { success: true, departments };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener departamentos' };
  }
}

export async function getDepartmentAction(id: string) {
  await loadAuth();
  
  if (!pb.authStore.isValid) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const department = await getDepartmentById(id);
    if (!department) {
      return { success: false, error: 'Departamento no encontrado' };
    }
    return { success: true, department };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener departamento' };
  }
}

export async function createDepartmentAction(formData: FormData) {
  await loadAuth();
  
  if (!checkSupervisor()) {
    return { success: false, error: 'Solo supervisores pueden crear departamentos' };
  }

  const nombre = formData.get('nombre') as string;
  const descripcion = formData.get('descripcion') as string;
  const email = formData.get('email') as string;

  if (!nombre || nombre.length < 3 || nombre.length > 50) {
    return { success: false, error: 'El nombre debe tener entre 3 y 50 caracteres' };
  }

  if (descripcion && descripcion.length > 500) {
    return { success: false, error: 'La descripción no puede exceder 500 caracteres' };
  }

  try {
    const result = await createDept({ nombre, descripcion, email });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    revalidatePath('/dashboard/departments');
    return { success: true, department: result.department };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear departamento' };
  }
}

export async function updateDepartmentAction(id: string, formData: FormData) {
  await loadAuth();
  
  if (!checkSupervisor()) {
    return { success: false, error: 'Solo supervisores pueden editar departamentos' };
  }

  const nombre = formData.get('nombre') as string;
  const descripcion = formData.get('descripcion') as string;
  const email = formData.get('email') as string;

  if (nombre && (nombre.length < 3 || nombre.length > 50)) {
    return { success: false, error: 'El nombre debe tener entre 3 y 50 caracteres' };
  }

  if (descripcion && descripcion.length > 500) {
    return { success: false, error: 'La descripción no puede exceder 500 caracteres' };
  }

  try {
    const result = await updateDept(id, { nombre, descripcion, email });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    revalidatePath('/dashboard/departments');
    return { success: true, department: result.department };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar departamento' };
  }
}

export async function deactivateDepartmentAction(id: string) {
  await loadAuth();
  
  if (!checkSupervisor()) {
    return { success: false, error: 'Solo supervisores pueden desactivar departamentos' };
  }

  try {
    const result = await deactivateDept(id);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    revalidatePath('/dashboard/departments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al desactivar departamento' };
  }
}

export async function activateDepartmentAction(id: string) {
  await loadAuth();
  
  if (!checkSupervisor()) {
    return { success: false, error: 'Solo supervisores pueden activar departamentos' };
  }

  try {
    const result = await activateDept(id);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    revalidatePath('/dashboard/departments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al activar departamento' };
  }
}

export async function getAgentsByDepartmentAction(departmentId: string) {
  await loadAuth();
  
  if (!pb.authStore.isValid) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const agents = await getAgentsByDepartment(departmentId);
    return { success: true, agents };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener agentes' };
  }
}

export async function getAvailableAgentsAction() {
  await loadAuth();
  console.log('getAvailableAgentsAction - auth valid:', pb.authStore.isValid);
  console.log('getAvailableAgentsAction - auth model:', pb.authStore.model);
  
  if (!pb.authStore.isValid) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const agents = await getAvailableAgents();
    console.log('getAvailableAgents - agents:', agents);
    return { success: true, agents };
  } catch (error: any) {
    console.log('getAvailableAgents - error:', error);
    return { success: false, error: error.message || 'Error al obtener agentes' };
  }
}

export async function assignAgentAction(agentId: string, departmentId: string | null) {
  await loadAuth();
  
  if (!checkSupervisor()) {
    return { success: false, error: 'Solo supervisores pueden asignar agentes' };
  }

  try {
    const result = await assignAgentToDepartment(agentId, departmentId);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    revalidatePath('/dashboard/departments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al asignar agente' };
  }
}