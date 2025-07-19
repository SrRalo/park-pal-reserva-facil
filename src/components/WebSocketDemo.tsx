import React from 'react';
import { useAdminDashboard } from '../hooks/useWebSocket';

const WebSocketDemo: React.FC = () => {
  const { connection, systemMonitor, reservaUpdates } = useAdminDashboard();

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'disconnected': return '🔴';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Monitor WebSocket - Sistema de Reservas
      </h1>

      {/* Estado de Conexión */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Estado de Conexión</h2>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {getConnectionStatusIcon(connection.connectionStatus)}
          </span>
          <span className={`font-medium ${getConnectionStatusColor(connection.connectionStatus)}`}>
            {connection.connectionStatus.toUpperCase()}
          </span>
          {connection.isConnected && (
            <span className="text-sm text-gray-500">
              - Recibiendo eventos en tiempo real
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitor del Sistema */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Monitor del Sistema</h2>
          
          {systemMonitor.latestSystemEvent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">Último Evento</h3>
              <div className="text-sm text-blue-800">
                <p><strong>Servicio:</strong> {systemMonitor.latestSystemEvent.service}</p>
                <p><strong>Estado:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    systemMonitor.latestSystemEvent.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : systemMonitor.latestSystemEvent.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {systemMonitor.latestSystemEvent.status}
                  </span>
                </p>
                {systemMonitor.latestSystemEvent.data.endpoint && (
                  <p><strong>Endpoint:</strong> {systemMonitor.latestSystemEvent.data.endpoint}</p>
                )}
                {systemMonitor.latestSystemEvent.data.response_time && (
                  <p><strong>Tiempo de Respuesta:</strong> {systemMonitor.latestSystemEvent.data.response_time}ms</p>
                )}
                {systemMonitor.latestSystemEvent.data.memory_usage && (
                  <p><strong>Uso de Memoria:</strong> {systemMonitor.latestSystemEvent.data.memory_usage}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h3 className="font-medium text-gray-700 mb-2">
              Historial ({systemMonitor.systemData.length} eventos)
            </h3>
            {systemMonitor.systemData.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay eventos del sistema aún...</p>
            ) : (
              systemMonitor.systemData.slice(0, 10).map((event, index) => (
                <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-sm">
                  <span className="font-mono">{event.service}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.status === 'active' ? 'bg-green-100 text-green-800' : 
                    event.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                  <span className="text-gray-500">
                    {event.data.timestamp && formatTimestamp(event.data.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>

          {systemMonitor.systemData.length > 0 && (
            <button
              onClick={systemMonitor.clearSystemData}
              className="mt-4 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Limpiar Historial
            </button>
          )}
        </div>

        {/* Monitor de Reservas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Monitor de Reservas</h2>
          
          {reservaUpdates.latestReservaEvent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-green-900 mb-2">Última Reserva</h3>
              <div className="text-sm text-green-800">
                <p><strong>Ticket ID:</strong> #{reservaUpdates.latestReservaEvent.ticket_id}</p>
                <p><strong>Usuario ID:</strong> {reservaUpdates.latestReservaEvent.usuario_id}</p>
                <p><strong>Acción:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    reservaUpdates.latestReservaEvent.action === 'created' 
                      ? 'bg-blue-100 text-blue-800' 
                      : reservaUpdates.latestReservaEvent.action === 'updated'
                      ? 'bg-yellow-100 text-yellow-800'
                      : reservaUpdates.latestReservaEvent.action === 'finalized'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {reservaUpdates.latestReservaEvent.action}
                  </span>
                </p>
                <p><strong>Estado:</strong> {reservaUpdates.latestReservaEvent.status}</p>
                <p><strong>Tipo:</strong> {reservaUpdates.latestReservaEvent.tipo_reserva}</p>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h3 className="font-medium text-gray-700 mb-2">
              Historial ({reservaUpdates.reservaEvents.length} eventos)
            </h3>
            {reservaUpdates.reservaEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay eventos de reservas aún...</p>
            ) : (
              reservaUpdates.reservaEvents.slice(0, 10).map((event, index) => (
                <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-sm">
                  <span className="font-mono">#{event.ticket_id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.action === 'created' ? 'bg-blue-100 text-blue-800' : 
                    event.action === 'updated' ? 'bg-yellow-100 text-yellow-800' :
                    event.action === 'finalized' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {event.action}
                  </span>
                  <span className="text-gray-500">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>

          {reservaUpdates.reservaEvents.length > 0 && (
            <button
              onClick={reservaUpdates.clearReservaEvents}
              className="mt-4 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Limpiar Historial
            </button>
          )}
        </div>
      </div>

      {/* Información de Configuración */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Configuración del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <strong>Backend URL:</strong> http://localhost:8000
          </div>
          <div>
            <strong>WebSocket URL:</strong> ws://localhost:6001
          </div>
          <div>
            <strong>Canales:</strong> system-monitor, reserva-updates
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketDemo;
