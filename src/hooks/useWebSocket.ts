import { useEffect, useState, useCallback } from 'react';
import { WebSocketService, SystemMonitorData, ReservaStatusData } from '../services/websocketService';

// Hook para el estado de conexión WebSocket
export const useWebSocketConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const wsService = WebSocketService.getInstance();
    
    const handleConnectionChange = (data: unknown) => {
      const connectionData = data as { status: string };
      setConnectionStatus(connectionData.status);
      setIsConnected(connectionData.status === 'connected');
    };

    wsService.addEventListener('connection', handleConnectionChange);

    // Limpiar listener al desmontar
    return () => {
      wsService.removeEventListener('connection', handleConnectionChange);
    };
  }, []);

  return { connectionStatus, isConnected };
};

// Hook para eventos de monitoreo del sistema
export const useSystemMonitor = () => {
  const [systemData, setSystemData] = useState<SystemMonitorData[]>([]);
  const [latestSystemEvent, setLatestSystemEvent] = useState<SystemMonitorData | null>(null);

  useEffect(() => {
    const wsService = WebSocketService.getInstance();

    const handleSystemEvent = (data: SystemMonitorData) => {
      setLatestSystemEvent(data);
      setSystemData(prev => [data, ...prev.slice(0, 49)]); // Mantener solo los últimos 50 eventos
    };

    wsService.subscribeToSystemMonitor(handleSystemEvent);

    return () => {
      // En este caso no hay método directo de unsubscribe, pero se manejará cuando se desconecte el servicio
    };
  }, []);

  const clearSystemData = useCallback(() => {
    setSystemData([]);
    setLatestSystemEvent(null);
  }, []);

  return {
    systemData,
    latestSystemEvent,
    clearSystemData,
  };
};

// Hook para eventos de reserva
export const useReservaUpdates = () => {
  const [reservaEvents, setReservaEvents] = useState<ReservaStatusData[]>([]);
  const [latestReservaEvent, setLatestReservaEvent] = useState<ReservaStatusData | null>(null);

  useEffect(() => {
    const wsService = WebSocketService.getInstance();

    const handleReservaEvent = (data: ReservaStatusData) => {
      setLatestReservaEvent(data);
      setReservaEvents(prev => [data, ...prev.slice(0, 99)]); // Mantener los últimos 100 eventos
    };

    wsService.subscribeToReservaUpdates(handleReservaEvent);

    return () => {
      // Cleanup se maneja automáticamente por el servicio
    };
  }, []);

  const clearReservaEvents = useCallback(() => {
    setReservaEvents([]);
    setLatestReservaEvent(null);
  }, []);

  return {
    reservaEvents,
    latestReservaEvent,
    clearReservaEvents,
  };
};

// Hook para eventos de reserva de usuario específico
export const useUserReservas = (userId: number | null) => {
  const [userReservaEvents, setUserReservaEvents] = useState<ReservaStatusData[]>([]);
  const [latestUserReservaEvent, setLatestUserReservaEvent] = useState<ReservaStatusData | null>(null);

  useEffect(() => {
    if (!userId) return;

    const wsService = WebSocketService.getInstance();

    const handleUserReservaEvent = (data: ReservaStatusData) => {
      setLatestUserReservaEvent(data);
      setUserReservaEvents(prev => [data, ...prev.slice(0, 49)]); // Mantener los últimos 50 eventos
    };

    wsService.subscribeToUserReservas(userId, handleUserReservaEvent);

    return () => {
      // Cleanup se maneja automáticamente
    };
  }, [userId]);

  const clearUserReservaEvents = useCallback(() => {
    setUserReservaEvents([]);
    setLatestUserReservaEvent(null);
  }, []);

  return {
    userReservaEvents,
    latestUserReservaEvent,
    clearUserReservaEvents,
  };
};

// Hook combinado para administradores que necesitan monitorear todo
export const useAdminDashboard = () => {
  const connection = useWebSocketConnection();
  const systemMonitor = useSystemMonitor();
  const reservaUpdates = useReservaUpdates();

  return {
    connection,
    systemMonitor,
    reservaUpdates,
  };
};
