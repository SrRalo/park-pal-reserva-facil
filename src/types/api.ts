// Response structures from Laravel backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Authentication types
export interface LoginResponse {
  success: boolean;
  data: {
    user: UsuarioReserva;
    access_token: string;
    token_type: string;
  };
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: UsuarioReserva;
    access_token: string;
    token_type: string;
  };
  message?: string;
}

// Backend entity types (matching Laravel models)
export interface UsuarioReserva {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  documento: string;
  telefono?: string;
  role: 'admin' | 'registrador' | 'reservador';
  estado: 'activo' | 'inactivo';
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

export interface EstacionamientoAdmin {
  id: number;
  nombre: string;
  email: string;
  direccion: string;
  espacios_totales: number;
  espacios_disponibles: number;
  precio_por_hora: number;
  precio_mensual: number;
  estado: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
}

export interface Vehiculo {
  placa: string; // Primary key
  usuario_id: number;
  modelo: string;
  color: string;
  estado: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  usuario_id: number;
  vehiculo_id: string; // placa
  estacionamiento_id: number;
  codigo_ticket: string;
  fecha_entrada: string;
  fecha_salida?: string;
  precio_total?: number;
  estado: 'activo' | 'finalizado' | 'cancelado' | 'pagado';
  tipo_reserva: 'por_horas' | 'mensual';
  horas_estimadas?: number;
  costo_estimado?: number;
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: number;
  ticket_id: number;
  usuario_id: number;
  monto: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  fecha_pago: string;
  datos_pago?: PaymentData;
  created_at: string;
  updated_at: string;
}

export interface PaymentData {
  numero_tarjeta?: string;
  cvv?: string;
  mes_expiracion?: string;
  anio_expiracion?: string;
  nombre_titular?: string;
  monto_recibido?: number;
  cambio?: number;
}

export interface Penalizacion {
  id: number;
  ticket_id: number;
  usuario_reserva_id: number;
  tipo: 'tiempo_excedido' | 'dano_propiedad' | 'mal_estacionamiento';
  motivo: string;
  monto: number;
  estado: 'activa' | 'pagada' | 'cancelada';
  fecha: string;
  created_at: string;
  updated_at: string;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido?: string;
  email: string;
  documento: string;
  telefono?: string;
  password: string;
  password_confirmation: string;
  role?: 'registrador' | 'reservador'; // Solo estos roles desde registro
}

export interface CreateReservaRequest {
  usuario_id: number;
  vehiculo_id: string; // placa
  estacionamiento_id: number;
  tipo_reserva: 'por_horas' | 'mensual';
  fecha_entrada?: string; // ✅ Fecha de entrada estimada
  fecha_salida_estimada?: string; // ✅ Fecha de salida estimada
  horas_estimadas?: number;
  dias_estimados?: number;
}

export interface FinalizarReservaRequest {
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  datos_pago?: PaymentData;
}

export interface CalcularPrecioRequest {
  estacionamiento_id: number;
  tipo_reserva: 'por_horas' | 'mensual';
  horas_estimadas?: number;
  dias_estimados?: number;
}

export interface SearchEstacionamientosRequest {
  fecha?: string;
  precio_max?: number;
  tipo_reserva?: 'por_horas' | 'mensual';
  ubicacion?: string;
}

// Response data types
export interface EstacionamientosDisponiblesResponse {
  estacionamientos_disponibles: EstacionamientoAdmin[];
  filtros_aplicados: SearchEstacionamientosRequest;
  total_encontrados: number;
}

export interface CalcularPrecioResponse {
  precio_estimado: number;
  desglose: {
    precio_base: number;
    impuestos?: number;
    descuentos?: number;
  };
  estacionamiento: EstacionamientoAdmin;
}

export interface ReservaResponse {
  ticket: Ticket;
  vehiculo: Vehiculo;
  estacionamiento: EstacionamientoAdmin;
  precio_estimado: number;
}

export interface FinalizarReservaResponse {
  ticket: Ticket;
  pago: Pago;
  total_pagado: number;
  cambio?: number;
}

export interface UserSummaryResponse {
  usuario: UsuarioReserva;
  estadisticas: {
    total_reservas: number;
    reservas_activas: number;
    total_pagado: number;
    penalizaciones_pendientes: number;
  };
  reservas_recientes: Ticket[];
  vehiculos: Vehiculo[];
}

export interface EstacionamientoReportResponse {
  estacionamiento: EstacionamientoAdmin;
  metricas: {
    ingresos_totales: number;
    reservas_completadas: number;
    ocupacion_promedio: number;
    ingresos_por_mes: Array<{
      mes: string;
      ingresos: number;
      reservas: number;
    }>;
  };
}
