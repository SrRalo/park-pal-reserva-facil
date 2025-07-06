// Índice centralizado de todos los servicios API
export { authService } from './authService';
export { estacionamientoService } from './estacionamientoService';
export { reservaService } from './reservaService';
export { vehiculoService } from './vehiculoService';

// Exportar tipos comunes
export type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  UsuarioReserva,
  EstacionamientoAdmin,
  Vehiculo,
  Ticket,
  Pago
} from '@/types/api';

// Exportar mappers
export { DataMapper } from '@/utils/mappers';

// Exportar cliente API
export { apiClient } from '@/lib/apiClient';
