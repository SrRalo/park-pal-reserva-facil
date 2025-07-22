import { Reservation } from '../types';

import { apiClient } from '@/lib/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface TicketAdmin {
  id: number;
  usuario_id: number;
  vehiculo_id: string;
  estacionamiento_id: number;
  codigo_ticket: string;
  fecha_entrada: string;
  fecha_salida?: string;
  tipo_reserva: 'por_horas' | 'mensual';
  estado: 'activo' | 'finalizado' | 'cancelado' | 'pagado';
  precio_total?: number | string;
  created_at: string;
  updated_at: string;
  // Relaciones incluidas
  usuario?: {
    id: number;
    nombre: string;
    apellido?: string;
    email: string;
    documento: string;
    role: string;
  };
  vehiculo?: {
    placa: string;
    modelo: string;
    color: string;
    estado: string;
  };
  estacionamiento?: {
    id: number;
    nombre: string;
    direccion: string;
    precio_por_hora: number;
    precio_mensual: number;
  };
}

export interface TicketAdminResponse {
  success: boolean;
  data: TicketAdmin[];
  message?: string;
}

export interface TicketSingleResponse {
  success: boolean;
  data: TicketAdmin;
  message?: string;
}

export interface TicketUpdateResponse {
  success: boolean;
  data?: TicketAdmin;
  message?: string;
}

class AdminTicketService {
  /**
   * Obtiene todos los tickets del sistema (para admin)
   */
  async getAllTickets(): Promise<TicketAdmin[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener los tickets');
      }

      console.log('Tickets obtenidos exitosamente:', data.data);
      return data.data || [];

    } catch (error) {
      console.error('Error al obtener tickets:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo los tickets activos
   */
  async getActiveTickets(): Promise<TicketAdmin[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/active/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data: TicketAdminResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener los tickets activos');
      }

      return data.data || [];

    } catch (error) {
      console.error('Error al obtener tickets activos:', error);
      throw error;
    }
  }

  /**
   * Finaliza un ticket específico
   */
  async finalizeTicket(ticketId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-tickets/${ticketId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al finalizar el ticket');
      }

      console.log('Ticket finalizado exitosamente:', data.message);
      return true;

    } catch (error) {
      console.error('Error al finalizar ticket:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un ticket
   */
  async updateTicketStatus(ticketId: number, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          estado: status
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data: TicketUpdateResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al actualizar el ticket');
      }

      console.log('Ticket actualizado exitosamente:', data.message);
      return true;

    } catch (error) {
      console.error('Error al actualizar ticket:', error);
      throw error;
    }
  }

  /**
   * Obtiene un ticket por su código
   */
  async getTicketByCode(codigo: string): Promise<TicketAdmin | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/code/${codigo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data: TicketSingleResponse = await response.json();
      
      if (!data.success) {
        return null;
      }

      return data.data;

    } catch (error) {
      console.error('Error al obtener ticket por código:', error);
      throw error;
    }
  }

  /**
   * Obtiene tickets por usuario
   */
  async getTicketsByUser(userId: number): Promise<TicketAdmin[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data: TicketAdminResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener los tickets del usuario');
      }

      return data.data || [];

    } catch (error) {
      console.error('Error al obtener tickets del usuario:', error);
      throw error;
    }
  }

  /**
   * Reportar un ticket con problema
   */
  async reportTicket(ticketId: number, reason: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-tickets/${ticketId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reason: reason
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al reportar el ticket');
      }

      console.log('Ticket reportado exitosamente:', data.message);
      return true;

    } catch (error) {
      console.error('Error al reportar ticket:', error);
      throw error;
    }
  }
}

export const adminTicketService = new AdminTicketService();
export default adminTicketService;
