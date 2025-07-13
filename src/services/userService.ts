import { apiClient } from '@/lib/apiClient';
import { ApiResponse } from '@/types/api';

// Tipos específicos para la gestión de usuarios
export interface UserData {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  telefono: string;
  role: 'admin' | 'registrador' | 'reservador';
  estado: 'activo' | 'inactivo';
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  telefono: string;
  password: string;
  role: 'registrador' | 'reservador'; // Solo estos roles desde la aplicación
  estado: 'activo' | 'inactivo';
}

export interface UpdateUserData {
  nombre?: string;
  apellido?: string;
  email?: string;
  documento?: string;
  telefono?: string;
  role?: 'admin' | 'registrador' | 'reservador';
  estado?: 'activo' | 'inactivo';
}

export interface UserStats {
  total: number;
  admin: number;
  registrador: number;
  reservador: number;
  activos: number;
  inactivos: number;
}

/**
 * Servicio para gestión de usuarios
 */
export class UserService {
  private static baseURL = '/usuarios';

  /**
   * Obtener todos los usuarios
   */
  static async getAllUsers(): Promise<UserData[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserData[]>>(this.baseURL);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener usuarios');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios activos
   */
  static async getActiveUsers(): Promise<UserData[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserData[]>>(`${this.baseURL}/active/list`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener usuarios activos');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(id: string): Promise<UserData> {
    try {
      const response = await apiClient.get<ApiResponse<UserData>>(`${this.baseURL}/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener usuario');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  static async getUserByEmail(email: string): Promise<UserData> {
    try {
      const response = await apiClient.get<ApiResponse<UserData>>(`${this.baseURL}/email/${encodeURIComponent(email)}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener usuario');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario
   */
  static async createUser(userData: CreateUserData): Promise<UserData> {
    try {
      const response = await apiClient.post<ApiResponse<UserData>>(this.baseURL, userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear usuario');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  static async updateUser(id: string, userData: UpdateUserData): Promise<UserData> {
    try {
      const response = await apiClient.put<ApiResponse<UserData>>(`${this.baseURL}/${id}`, userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar usuario');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`${this.baseURL}/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Calcular estadísticas de usuarios
   */
  static calculateUserStats(users: UserData[]): UserStats {
    const stats = {
      total: users.length,
      admin: 0,
      registrador: 0,
      reservador: 0,
      activos: 0,
      inactivos: 0
    };

    users.forEach(user => {
      // Contar por rol (inferido desde email o campo role si existe)
      const role = this.inferUserRole(user.email);
      if (role === 'admin') stats.admin++;
      else if (role === 'registrador') stats.registrador++;
      else if (role === 'reservador') stats.reservador++;

      // Contar por estado
      if (user.estado === 'activo') stats.activos++;
      else stats.inactivos++;
    });

    return stats;
  }

  /**
   * Inferir rol del usuario desde email
   */
  private static inferUserRole(email: string): 'admin' | 'registrador' | 'reservador' {
    // Lógica para inferir rol basada en email
    if (email.includes('admin') || email.includes('administrador')) {
      return 'admin';
    }
    if (email.includes('registrador') || email.includes('owner')) {
      return 'registrador';
    }
    return 'reservador';
  }

  /**
   * Mapear UserData a User para compatibilidad con el tipo frontend
   */
  static mapUserDataToUser(userData: UserData): {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'registrador' | 'reservador';
    documento?: string;
    telefono?: string;
    estado?: 'activo' | 'inactivo';
    apellido?: string;
  } {
    return {
      id: userData.id,
      name: `${userData.nombre} ${userData.apellido}`.trim(),
      email: userData.email,
      role: this.inferUserRole(userData.email),
      documento: userData.documento,
      telefono: userData.telefono,
      estado: userData.estado,
      apellido: userData.apellido
    };
  }

  /**
   * Validar datos de usuario
   */
  static validateUserData(userData: CreateUserData | UpdateUserData): string[] {
    const errors: string[] = [];

    if ('nombre' in userData && userData.nombre && userData.nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if ('apellido' in userData && userData.apellido && userData.apellido.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    if ('email' in userData && userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('El email no tiene un formato válido');
      }
    }

    if ('documento' in userData && userData.documento && userData.documento.trim().length < 6) {
      errors.push('El documento debe tener al menos 6 caracteres');
    }

    if ('telefono' in userData && userData.telefono && userData.telefono.trim().length < 8) {
      errors.push('El teléfono debe tener al menos 8 caracteres');
    }

    if ('password' in userData && userData.password && userData.password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    return errors;
  }

  /**
   * Obtener usuarios por rol específico
   */
  static async getUsersByRole(role: 'admin' | 'registrador' | 'reservador'): Promise<UserData[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserData[]>>(`${this.baseURL}/role/${role}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error obteniendo usuarios por rol');
    } catch (error) {
      console.error('Error obteniendo usuarios por rol:', error);
      throw error;
    }
  }

  /**
   * Actualizar rol de usuario (solo admin)
   */
  static async updateUserRole(userId: string, role: 'admin' | 'registrador' | 'reservador'): Promise<UserData> {
    try {
      const response = await apiClient.put<ApiResponse<UserData>>(`${this.baseURL}/${userId}/role`, {
        role
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error actualizando rol de usuario');
    } catch (error) {
      console.error('Error actualizando rol:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios por rol
   */
  static async getRoleStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>(`${this.baseURL}/stats/roles`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error obteniendo estadísticas');
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

export default UserService;
