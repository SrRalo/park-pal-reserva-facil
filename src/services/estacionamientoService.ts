import { apiClient } from '@/lib/apiClient';
import { 
  EstacionamientoAdmin,
  EstacionamientosDisponiblesResponse,
  CalcularPrecioRequest,
  CalcularPrecioResponse,
  SearchEstacionamientosRequest,
  ApiResponse 
} from '@/types/api';

export class EstacionamientoService {
  /**
   * Obtener estacionamientos disponibles
   */
  async getEstacionamientosDisponibles(
    filters: SearchEstacionamientosRequest = {}
  ): Promise<EstacionamientoAdmin[]> {
    try {
      const response = await apiClient.get<ApiResponse<EstacionamientosDisponiblesResponse>>(
        '/business/estacionamientos/disponibles',
        { params: filters }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.estacionamientos_disponibles;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting available estacionamientos:', error);
      throw new Error('Error obteniendo estacionamientos disponibles');
    }
  }

  /**
   * Calcular precio estimado
   */
  async calcularPrecio(data: CalcularPrecioRequest): Promise<CalcularPrecioResponse> {
    try {
      const response = await apiClient.post<ApiResponse<CalcularPrecioResponse>>(
        '/business/calcular-precio',
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo calcular el precio');
    } catch (error) {
      console.error('Error calculating price:', error);
      throw new Error('Error calculando precio');
    }
  }

  /**
   * Obtener todos los estacionamientos (CRUD)
   */
  async getAllEstacionamientos(): Promise<EstacionamientoAdmin[]> {
    try {
      const response = await apiClient.get<ApiResponse<EstacionamientoAdmin[]>>('/estacionamientos');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all estacionamientos:', error);
      throw new Error('Error obteniendo estacionamientos');
    }
  }

  /**
   * Obtener estacionamiento por ID
   */
  async getEstacionamientoById(id: number): Promise<EstacionamientoAdmin | null> {
    try {
      const response = await apiClient.get<ApiResponse<EstacionamientoAdmin>>(`/estacionamientos/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting estacionamiento by ID:', error);
      return null;
    }
  }

  /**
   * Crear nuevo estacionamiento
   */
  async createEstacionamiento(data: Partial<EstacionamientoAdmin>): Promise<EstacionamientoAdmin> {
    try {
      const response = await apiClient.post<ApiResponse<EstacionamientoAdmin>>(
        '/estacionamientos',
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo crear el estacionamiento');
    } catch (error) {
      console.error('Error creating estacionamiento:', error);
      throw new Error('Error creando estacionamiento');
    }
  }

  /**
   * Actualizar estacionamiento
   */
  async updateEstacionamiento(
    id: number, 
    data: Partial<EstacionamientoAdmin>
  ): Promise<EstacionamientoAdmin> {
    try {
      const response = await apiClient.put<ApiResponse<EstacionamientoAdmin>>(
        `/estacionamientos/${id}`,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo actualizar el estacionamiento');
    } catch (error) {
      console.error('Error updating estacionamiento:', error);
      throw new Error('Error actualizando estacionamiento');
    }
  }

  /**
   * Eliminar estacionamiento
   */
  async deleteEstacionamiento(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/estacionamientos/${id}`);
      
      if (!response.data.success) {
        throw new Error('No se pudo eliminar el estacionamiento');
      }
    } catch (error) {
      console.error('Error deleting estacionamiento:', error);
      throw new Error('Error eliminando estacionamiento');
    }
  }

  /**
   * Obtener reporte de estacionamiento
   */
  async getEstacionamientoReporte(id: number): Promise<unknown> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>(
        `/business/estacionamientos/${id}/reporte`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo obtener el reporte');
    } catch (error) {
      console.error('Error getting estacionamiento report:', error);
      throw new Error('Error obteniendo reporte');
    }
  }
}

export const estacionamientoService = new EstacionamientoService();
