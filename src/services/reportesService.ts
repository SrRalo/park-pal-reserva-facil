import { Income, ReportFilter } from '../types';

import { apiClient } from '@/lib/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '/api/business') || 'http://localhost:8000/api/business';

export interface ReportesResponse {
  success: boolean;
  data: Income[];
  message?: string;
}

export interface ReportesParams {
  user_id: number;
  start_date: string;
  end_date: string;
  group_by?: 'day' | 'week' | 'month';
}

export interface ReservationStats {
  total_reservations: number;
  completed_reservations: number;
  active_reservations: number;
  total_income: number;
  average_income: number;
  period: string;
}

export interface ReservationByStatus {
  status: string;
  count: number;
  total_amount: number;
}

class ReportesService {
  /**
   * Obtiene el reporte de ingresos desde el endpoint del backend
   */
  async getIncomeReport(filter: ReportFilter, ownerId: string): Promise<Income[]> {
    try {
      const params: ReportesParams = {
        user_id: parseInt(ownerId),
        start_date: filter.startDate.toISOString().split('T')[0], // YYYY-MM-DD
        end_date: filter.endDate.toISOString().split('T')[0], // YYYY-MM-DD
        group_by: 'day'
      };

      const queryString = new URLSearchParams({
        user_id: params.user_id.toString(),
        start_date: params.start_date,
        end_date: params.end_date,
        group_by: params.group_by || 'day'
      }).toString();
      const url = `${API_BASE_URL}/reportes/ingresos?${queryString}`;
      
      console.log('Llamando a endpoint de reportes:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
      }

      const data: ReportesResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener el reporte de ingresos');
      }

      // Transformar los datos al formato esperado por el frontend
      const incomeData: Income[] = data.data.map(item => ({
        date: new Date(item.date),
        amount: item.amount,
        reservationCount: item.reservationCount
      }));

      console.log('Reporte de ingresos obtenido exitosamente:', incomeData);
      return incomeData;

    } catch (error) {
      console.error('Error al obtener reporte de ingresos:', error);
      
      // Fallback a implementación temporal si el endpoint falla
      console.log('Usando implementación temporal como fallback...');
      return this.getIncomeReportFallback(filter, ownerId);
    }
  }

  /**
   * Implementación temporal/fallback usando datos locales
   */
  private async getIncomeReportFallback(filter: ReportFilter, ownerId: string): Promise<Income[]> {
    try {
      // Aquí deberías importar y usar la función getUserReservations desde el contexto
      // Por simplicidad, retornamos un array vacío
      console.warn('Usando fallback - retornando datos vacíos');
      return [];
    } catch (error) {
      console.error('Error en fallback:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas de reservas
   */
  async getReservationStats(ownerId: string, period: string = 'week'): Promise<ReservationStats | null> {
    try {
      const params = {
        user_id: parseInt(ownerId),
        period: period
      };

      const queryString = new URLSearchParams({
        user_id: params.user_id.toString(),
        period: params.period
      }).toString();
      const url = `${API_BASE_URL}/reportes/estadisticas?${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;

    } catch (error) {
      console.error('Error al obtener estadísticas de reservas:', error);
      return null;
    }
  }

  /**
   * Obtiene reporte de reservas por estado
   */
  async getReservationsByStatus(ownerId: string, startDate: string, endDate: string): Promise<ReservationByStatus[]> {
    try {
      const params = {
        user_id: parseInt(ownerId),
        start_date: startDate,
        end_date: endDate
      };

      const queryString = new URLSearchParams({
        user_id: params.user_id.toString(),
        start_date: params.start_date,
        end_date: params.end_date
      }).toString();
      const url = `${API_BASE_URL}/reportes/reservas-por-estado?${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];

    } catch (error) {
      console.error('Error al obtener reporte por estado:', error);
      return [];
    }
  }
}

export const reportesService = new ReportesService();
export default reportesService;
