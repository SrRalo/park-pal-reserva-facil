import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configuración de Pusher
window.Pusher = Pusher;

// Configuración del WebSocket
const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY || 'local-key',
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  wsHost: import.meta.env.VITE_PUSHER_HOST || '127.0.0.1',
  wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT || '6001'),
  wssPort: parseInt(import.meta.env.VITE_PUSHER_PORT || '6001'),
  disableStats: true,
  auth: {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
  },
});

// Interface para eventos de monitoreo del sistema
export interface SystemMonitorData {
  service: string;
  status: 'active' | 'inactive' | 'error';
  data: {
    endpoint?: string;
    response_time?: number;
    memory_usage?: string;
    cpu_usage?: number;
    database_status?: string;
    cache_status?: string;
    timestamp?: string;
  };
}

// Interface para eventos de reserva
export interface ReservaStatusData {
  ticket_id: number;
  usuario_id: number;
  estacionamiento_id: number;
  status: 'activo' | 'finalizado' | 'cancelado' | 'eliminado';
  tipo_reserva: 'por_horas' | 'mensual';
  action: 'created' | 'updated' | 'deleted' | 'finalized';
  timestamp: string;
}

// Tipos para eventos genéricos
type EventCallback = (data: unknown) => void;
type ConnectionEvent = { status: string; error?: unknown };

// Clase principal del servicio WebSocket
export class WebSocketService {
  private static instance: WebSocketService;
  private echo: typeof echo;
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'connecting';
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() {
    this.echo = echo;
    this.setupConnectionListeners();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private setupConnectionListeners() {
    // Eventos de conexión de Pusher - usando any para evitar problemas de tipado complejo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (this.echo.connector as any);
    
    connector.pusher.connection.bind('connected', () => {
      this.connectionStatus = 'connected';
      console.log('✅ WebSocket conectado exitosamente');
      this.notifyListeners('connection', { status: 'connected' });
    });

    connector.pusher.connection.bind('disconnected', () => {
      this.connectionStatus = 'disconnected';
      console.log('❌ WebSocket desconectado');
      this.notifyListeners('connection', { status: 'disconnected' });
    });

    connector.pusher.connection.bind('error', (error: unknown) => {
      this.connectionStatus = 'error';
      console.error('❌ Error en WebSocket:', error);
      this.notifyListeners('connection', { status: 'error', error });
    });

    connector.pusher.connection.bind('connecting', () => {
      this.connectionStatus = 'connecting';
      console.log('🔄 Conectando WebSocket...');
      this.notifyListeners('connection', { status: 'connecting' });
    });
  }

  private notifyListeners(event: string, data: unknown) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => listener(data));
  }

  // Método para escuchar el canal de monitoreo del sistema
  public subscribeToSystemMonitor(callback: (data: SystemMonitorData) => void): void {
    this.echo.channel('system-monitor')
      .listen('system.monitor', (data: SystemMonitorData) => {
        console.log('📊 Evento de sistema recibido:', data);
        callback(data);
      });
  }

  // Método para escuchar eventos de reserva
  public subscribeToReservaUpdates(callback: (data: ReservaStatusData) => void): void {
    this.echo.channel('reserva-updates')
      .listen('reserva.status', (data: ReservaStatusData) => {
        console.log('🎫 Evento de reserva recibido:', data);
        callback(data);
      });
  }

  // Método para escuchar eventos de reserva de un usuario específico
  public subscribeToUserReservas(userId: number, callback: (data: ReservaStatusData) => void): void {
    this.echo.private(`user.${userId}.reservas`)
      .listen('reserva.status', (data: ReservaStatusData) => {
        console.log(`🎫 Evento de reserva para usuario ${userId}:`, data);
        callback(data);
      });
  }

  // Método genérico para agregar listeners
  public addEventListener(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Método para remover listeners
  public removeEventListener(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Método para desconectarse
  public disconnect(): void {
    this.echo.disconnect();
    this.connectionStatus = 'disconnected';
  }

  // Método para reconectarse
  public reconnect(): void {
    this.echo.connect();
  }

  // Getter para obtener el estado de conexión
  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  // Método para verificar si está conectado
  public isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }
}

// Hook personalizado para usar el servicio WebSocket
export const useWebSocket = () => {
  const webSocketService = WebSocketService.getInstance();
  return webSocketService;
};

export default WebSocketService;
