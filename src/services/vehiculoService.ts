import { apiClient } from '@/lib/apiClient';
import { Vehiculo, ApiResponse } from '@/types/api';

export class VehiculoService {
  /**
   * Obtener todos los vehículos
   */
  async getAllVehiculos(): Promise<Vehiculo[]> {
    try {
      const response = await apiClient.get<ApiResponse<Vehiculo[]>>('/vehiculos');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all vehiculos:', error);
      return [];
    }
  }

  /**
   * Obtener vehículos por usuario
   */
  async getVehiculosByUser(userId: number): Promise<Vehiculo[]> {
    try {
      const response = await apiClient.get<ApiResponse<Vehiculo[]>>(
        `/vehiculos/user/${userId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting vehiculos by user:', error);
      return [];
    }
  }

  /**
   * Obtener vehículo por placa
   */
  async getVehiculoByPlaca(placa: string): Promise<Vehiculo | null> {
    try {
      const response = await apiClient.get<ApiResponse<Vehiculo>>(`/vehiculos/placa/${placa}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting vehiculo by placa:', error);
      return null;
    }
  }

  /**
   * Actualizar vehículo (usa placa como identificador)
   */
  async updateVehiculo(placa: string, data: Partial<Vehiculo>): Promise<Vehiculo> {
    try {
      const response = await apiClient.put<ApiResponse<Vehiculo>>(`/vehiculos/${placa}`, data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo actualizar el vehículo');
    } catch (error) {
      console.error('Error updating vehiculo:', error);
      throw new Error('Error actualizando vehículo');
    }
  }

  /**
   * Eliminar vehículo (usa placa como identificador)
   */
  async deleteVehiculo(placa: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/vehiculos/${placa}`);
      
      if (!response.data.success) {
        throw new Error('No se pudo eliminar el vehículo');
      }
    } catch (error) {
      console.error('Error deleting vehiculo:', error);
      throw new Error('Error eliminando vehículo');
    }
  }

  /**
   * Crear nuevo vehículo
   */
  async createVehiculo(data: Omit<Vehiculo, 'created_at' | 'updated_at'>): Promise<Vehiculo> {
    try {
      const response = await apiClient.post<ApiResponse<Vehiculo>>('/vehiculos', data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo crear el vehículo');
    } catch (error) {
      console.error('Error creating vehiculo:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error creando vehículo');
    }
  }
}

export const vehiculoService = new VehiculoService();
