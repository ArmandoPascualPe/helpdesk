import { pb, getPb } from './pocketbase';

export interface User {
  id: string;
  email: string;
  rol: 'cliente' | 'agente' | 'supervisor';
  departamento?: string;
  nombre?: string;
}

export async function login(email: string, password: string) {
  const pb = getPb();
  try {
    const authData = await pb.collection('usuarios').authWithPassword(email, password);
    return { success: true, user: authData.record, token: authData.token };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al iniciar sesión' };
  }
}

export async function register(email: string, password: string, nombre: string) {
  const pb = getPb();
  try {
    const userData = await pb.collection('usuarios').create({
      email,
      password,
      passwordConfirm: password,
      nombre,
      rol: 'cliente',
    });
    return { success: true, user: userData };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al registrar' };
  }
}

export function logout() {
  const pb = getPb();
  pb.authStore.clear();
  if (typeof window !== 'undefined') {
    localStorage.removeItem("pb_auth");
  }
}

export function currentUser(): User | null {
  const pb = getPb();
  if (!pb.authStore.isValid) return null;
  return pb.authStore.model as User;
}

export function isAuthenticated(): boolean {
  return getPb().authStore.isValid;
}
