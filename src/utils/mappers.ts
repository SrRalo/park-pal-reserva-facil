import { 
  UsuarioReserva, 
  EstacionamientoAdmin, 
  Vehiculo as BackendVehiculo,
  Ticket as BackendTicket,
  Pago as BackendPago
} from '@/types/api';

import { 
  User, 
  ParkingSpot, 
  Reservation 
} from '@/types';

// Tipos adicionales para el frontend que no están en el index principal
export interface Vehicle {
  id: string;
  plate: string;
  type: 'carro' | 'moto' | 'bicicleta';
  model?: string;
  color?: string;
  userId: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  reservationId: string;
  userId: string;
  amount: number;
  method: 'efectivo' | 'tarjeta' | 'transferencia';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
  createdAt: Date;
}

/**
 * Mappers para convertir datos entre backend y frontend
 */
export class DataMapper {
  /**
   * Convierte UsuarioReserva (backend) a User (frontend)
   */
  static usuarioReservaToUser(usuarioReserva: UsuarioReserva): User {
    // Determinar rol basado en el email o algún criterio
    // Lógica de mapeo mejorada:
    // - Si el email contiene "admin" o "administrador" -> admin
    // - Si el email contiene "registrador", "dueño", "owner", "gerente" -> registrador  
    // - Por defecto -> reservador
    let role: "admin" | "registrador" | "reservador" = 'reservador';
    
    const emailLower = usuarioReserva.email.toLowerCase();
    
    // Verificar si es admin
    if (emailLower.includes('admin') || emailLower.includes('administrador')) {
      role = 'admin';
    } 
    // Verificar si es registrador (propietario de plazas)
    else if (emailLower.includes('registrador') || 
             emailLower.includes('dueño') || 
             emailLower.includes('owner') || 
             emailLower.includes('gerente') || 
             emailLower.includes('propietario')) {
      role = 'registrador';
    }
    // Por defecto es reservador
    
    console.log(`🔍 Mapeo de rol para ${usuarioReserva.email}: ${role}`);
    
    return {
      id: usuarioReserva.id.toString(),
      name: usuarioReserva.nombre,
      email: usuarioReserva.email,
      role: role,
    };
  }

  /**
   * Convierte EstacionamientoAdmin (backend) a ParkingSpot (frontend)
   */
  static estacionamientoToParkingSpot(estacionamiento: EstacionamientoAdmin): ParkingSpot {
    return {
      id: estacionamiento.id.toString(),
      name: estacionamiento.nombre,
      location: estacionamiento.direccion,
      hourlyRate: estacionamiento.precio_por_hora,
      type: 'standard', // Se puede ajustar según lógica de negocio
      status: estacionamiento.estado === 'activo' ? 'available' : 'occupied',
      ownerId: '1', // Se puede ajustar según lógica de negocio
    };
  }

  /**
   * Convierte Vehiculo (backend) a Vehicle (frontend)
   */
  static vehiculoToVehicle(vehiculo: BackendVehiculo): Vehicle {
    return {
      id: vehiculo.id.toString(),
      plate: vehiculo.placa,
      type: vehiculo.tipo,
      model: vehiculo.modelo,
      color: vehiculo.color,
      userId: vehiculo.usuario_id.toString(),
      createdAt: new Date(vehiculo.created_at),
    };
  }

  /**
   * Convierte Ticket (backend) a Reservation (frontend)
   */
  static ticketToReservation(ticket: BackendTicket): Reservation {
    return {
      id: ticket.id.toString(),
      userId: ticket.usuario_id.toString(),
      spotId: ticket.estacionamiento_id.toString(),
      entryTime: new Date(ticket.fecha_entrada),
      exitTime: ticket.fecha_salida ? new Date(ticket.fecha_salida) : null,
      estimatedEntryTime: new Date(ticket.fecha_entrada),
      estimatedExitTime: ticket.fecha_salida ? new Date(ticket.fecha_salida) : new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 horas por defecto
      status: this.mapTicketStatus(ticket.estado),
      totalCost: ticket.precio_total || 0,
      licensePlate: ticket.vehiculo_id,
    };
  }

  /**
   * Convierte Pago (backend) a Payment (frontend)
   */
  static pagoToPayment(pago: BackendPago): Payment {
    return {
      id: pago.id.toString(),
      reservationId: pago.ticket_id.toString(),
      userId: pago.usuario_id.toString(),
      amount: pago.monto,
      method: pago.metodo_pago,
      status: this.mapPaymentStatus(pago.estado),
      date: new Date(pago.fecha_pago),
      createdAt: new Date(pago.created_at),
    };
  }

  /**
   * Convierte User (frontend) a datos para backend
   */
  static userToUsuarioReserva(user: User, additionalData?: {
    documento?: string;
    telefono?: string;
    apellido?: string;
  }): Partial<UsuarioReserva> {
    return {
      nombre: user.name,
      email: user.email,
      documento: additionalData?.documento || '12345678',
      telefono: additionalData?.telefono,
      apellido: additionalData?.apellido,
      estado: 'activo',
    };
  }

  /**
   * Convierte ParkingSpot (frontend) a datos para backend
   */
  static parkingSpotToEstacionamiento(spot: ParkingSpot, additionalData?: {
    email?: string;
    espacios_totales?: number;
    espacios_disponibles?: number;
    precio_mensual?: number;
  }): Partial<EstacionamientoAdmin> {
    return {
      nombre: spot.name,
      direccion: spot.location,
      precio_por_hora: spot.hourlyRate,
      precio_mensual: additionalData?.precio_mensual || spot.hourlyRate * 160, // 160 horas por mes aprox
      espacios_totales: additionalData?.espacios_totales || 20,
      espacios_disponibles: additionalData?.espacios_disponibles || 20,
      estado: spot.status === 'available' ? 'activo' : 'inactivo',
      email: additionalData?.email || '',
    };
  }

  /**
   * Convierte Vehicle (frontend) a datos para backend
   */
  static vehicleToVehiculo(vehicle: Vehicle): Partial<BackendVehiculo> {
    return {
      placa: vehicle.plate,
      tipo: vehicle.type,
      modelo: vehicle.model,
      color: vehicle.color,
      usuario_id: parseInt(vehicle.userId),
    };
  }

  /**
   * Mapea estados de tickets del backend al frontend
   */
  private static mapTicketStatus(backendStatus: BackendTicket['estado']): Reservation['status'] {
    const statusMap: Record<BackendTicket['estado'], Reservation['status']> = {
      'activo': 'active',
      'finalizado': 'completed',
      'cancelado': 'cancelled',
      'pagado': 'completed', // Pagado se mapea a completed
    };
    return statusMap[backendStatus] || 'active';
  }

  /**
   * Mapea estados de pagos del backend al frontend
   */
  private static mapPaymentStatus(backendStatus: BackendPago['estado']): Payment['status'] {
    const statusMap: Record<BackendPago['estado'], Payment['status']> = {
      'pendiente': 'pending',
      'completado': 'completed',
      'fallido': 'failed',
      'reembolsado': 'refunded',
    };
    return statusMap[backendStatus] || 'pending';
  }

  /**
   * Mapea arrays de datos
   */
  static mapArray<T, U>(
    items: T[], 
    mapper: (item: T) => U
  ): U[] {
    return items.map(mapper);
  }

  /**
   * Mapea arrays de estacionamientos
   */
  static mapEstacionamientos(estacionamientos: EstacionamientoAdmin[]): ParkingSpot[] {
    return this.mapArray(estacionamientos, this.estacionamientoToParkingSpot);
  }

  /**
   * Mapea arrays de vehículos
   */
  static mapVehiculos(vehiculos: BackendVehiculo[]): Vehicle[] {
    return this.mapArray(vehiculos, this.vehiculoToVehicle);
  }

  /**
   * Mapea arrays de tickets/reservas
   */
  static mapTickets(tickets: BackendTicket[]): Reservation[] {
    return this.mapArray(tickets, this.ticketToReservation);
  }

  /**
   * Mapea arrays de pagos
   */
  static mapPagos(pagos: BackendPago[]): Payment[] {
    return this.mapArray(pagos, this.pagoToPayment);
  }
}
