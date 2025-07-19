import { apiClient } from '@/lib/apiClient';
import { 
  CreateReservaRequest,
  FinalizarReservaRequest,
  ReservaResponse,
  FinalizarReservaResponse,
  Ticket,
  ApiResponse 
} from '@/types/api';

export class ReservaService {
  /**
   * Crear nueva reserva
   */
  async crearReserva(data: CreateReservaRequest): Promise<ReservaResponse> {
    try {
      const response = await apiClient.post<ApiResponse<ReservaResponse>>(
        '/business/reservas',
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo crear la reserva');
    } catch (error) {
      console.error('Error creating reserva:', error);
      throw new Error('Error creando reserva');
    }
  }

  /**
   * Finalizar reserva con pago
   */
  async finalizarReserva(
    ticketId: number, 
    paymentData: FinalizarReservaRequest
  ): Promise<FinalizarReservaResponse> {
    try {
      const response = await apiClient.post<ApiResponse<FinalizarReservaResponse>>(
        `/business/reservas/${ticketId}/finalizar`,
        paymentData
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo finalizar la reserva');
    } catch (error) {
      console.error('Error finalizing reserva:', error);
      throw new Error('Error finalizando reserva');
    }
  }

  /**
   * Cancelar reserva
   */
  async cancelarReserva(ticketId: number, motivo?: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `/business/reservas/${ticketId}/cancelar`,
        { motivo: motivo || 'Cancelación solicitada por el usuario' }
      );
      
      if (!response.data.success) {
        throw new Error('No se pudo cancelar la reserva');
      }
    } catch (error) {
      console.error('Error canceling reserva:', error);
      throw new Error('Error cancelando reserva');
    }
  }

  /**
   * Obtener reservas del usuario
   */
  async getReservasByUser(userId: number): Promise<Ticket[]> {
    try {
      const response = await apiClient.get<ApiResponse<Ticket[]>>(
        `/tickets/user/${userId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user reservas:', error);
      return [];
    }
  }

  /**
   * Obtener resumen del usuario
   */
  async getUserSummary(userId: number): Promise<unknown> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>(
        `/business/usuarios/${userId}/resumen`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo obtener el resumen del usuario');
    } catch (error) {
      console.error('Error getting user summary:', error);
      throw new Error('Error obteniendo resumen del usuario');
    }
  }

  /**
   * Procesar pago manual (efectivo)
   */
  async procesarPagoManual(
    ticketId: number, 
    data: { metodo_pago: 'efectivo'; monto_recibido: number }
  ): Promise<unknown> {
    try {
      const response = await apiClient.post<ApiResponse<unknown>>(
        `/business/tickets/${ticketId}/pago-manual`,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo procesar el pago');
    } catch (error) {
      console.error('Error processing manual payment:', error);
      throw new Error('Error procesando pago manual');
    }
  }

  /**
   * Aplicar penalización
   */
  async aplicarPenalizacion(data: {
    ticket_id: number;
    tipo: 'tiempo_excedido' | 'dano_propiedad' | 'mal_estacionamiento';
    descripcion?: string;
    monto?: number;
  }): Promise<unknown> {
    try {
      const response = await apiClient.post<ApiResponse<unknown>>(
        '/business/penalizaciones/aplicar',
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo aplicar la penalización');
    } catch (error) {
      console.error('Error applying penalty:', error);
      throw new Error('Error aplicando penalización');
    }
  }

  /**
   * Procesar reembolso
   */
  async procesarReembolso(pagoId: number, motivo?: string): Promise<unknown> {
    try {
      const response = await apiClient.post<ApiResponse<unknown>>(
        `/business/pagos/${pagoId}/reembolsar`,
        { motivo: motivo || 'Reembolso solicitado' }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('No se pudo procesar el reembolso');
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Error procesando reembolso');
    }
  }

  /**
   * Obtener todos los tickets del sistema (solo para admin)
   */
  async getAllTickets(): Promise<Ticket[]> {
    try {
      const response = await apiClient.get<ApiResponse<Ticket[]>>('/tickets');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all tickets:', error);
      return [];
    }
  }
}

export const reservaService = new ReservaService();
