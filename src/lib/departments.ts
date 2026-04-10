import { getPb } from './pocketbase';

export interface Department {
  id: string;
  nombre: string;
  descripcion: string;
  email: string;
  activo: boolean;
  created: string;
  updated: string;
}

export async function getDepartments(includeInactive = false): Promise<Department[]> {
  const pb = getPb();
  const filter = includeInactive ? '' : 'activo = true';
  const records = await pb.collection('departamentos').getList<Department>(1, 50, {
    filter,
    sort: 'nombre',
  });
  return records.items;
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  const pb = getPb();
  try {
    return await pb.collection('departamentos').getOne<Department>(id);
  } catch {
    return null;
  }
}

export async function createDepartment(data: {
  nombre: string;
  descripcion: string;
  email?: string;
}): Promise<{ success: boolean; department?: Department; error?: string }> {
  const pb = getPb();
  try {
    const department = await pb.collection('departamentos').create({
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      email: data.email || '',
      activo: true,
    });
    return { success: true, department };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear departamento' };
  }
}

export async function updateDepartment(id: string, data: {
  nombre?: string;
  descripcion?: string;
  email?: string;
}): Promise<{ success: boolean; department?: Department; error?: string }> {
  const pb = getPb();
  try {
    const department = await pb.collection('departamentos').update(id, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      email: data.email,
    });
    return { success: true, department };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar departamento' };
  }
}

export async function hasOpenTickets(departmentId: string): Promise<boolean> {
  const pb = getPb();
  const records = await pb.collection('tickets').getList(1, 1, {
    filter: `departamento = "${departmentId}" && estado != "cerrado"`,
  });
  return records.totalCount > 0;
}

export async function deactivateDepartment(id: string): Promise<{ success: boolean; error?: string }> {
  const hasOpen = await hasOpenTickets(id);
  if (hasOpen) {
    return { success: false, error: 'No se puede desactivar: hay tickets abiertos en este departamento' };
  }

  const pb = getPb();
  try {
    await pb.collection('departamentos').update(id, { activo: false });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al desactivar departamento' };
  }
}

export async function activateDepartment(id: string): Promise<{ success: boolean; error?: string }> {
  const pb = getPb();
  try {
    await pb.collection('departamentos').update(id, { activo: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al activar departamento' };
  }
}

export interface Agent {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: string;
  departamento: string;
}

export async function getAgentsByDepartment(departmentId: string): Promise<Agent[]> {
  const pb = getPb();
  console.log('getAgentsByDepartment - departmentId:', departmentId);
  const records = await pb.collection('usuarios').getList<Agent>(1, 100, {
    filter: `departamento = "${departmentId}" && rol = "agente"`,
    sort: 'first_name',
  });
  console.log('getAgentsByDepartment - records:', records.items);
  return records.items;
}

export async function getAvailableAgents(): Promise<Agent[]> {
  const pb = getPb();
  const records = await pb.collection('usuarios').getList<Agent>(1, 100, {
    filter: `rol = "agente"`,
    sort: 'first_name',
  });
  return records.items;
}

export async function assignAgentToDepartment(
  agentId: string,
  departmentId: string | null
): Promise<{ success: boolean; error?: string }> {
  const pb = getPb();
  try {
    await pb.collection('usuarios').update(agentId, {
      departamento: departmentId || '',
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al asignar agente' };
  }
}