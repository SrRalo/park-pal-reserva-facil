import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ParkingSpot, Reservation, Income, ReportFilter, TicketInfo, CURRENCY } from "../types";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { DollarSign } from "lucide-react";
import { 
  estacionamientoService, 
  reservaService, 
  vehiculoService 
} from "../services";
import { reportesService } from "../services/reportesService";
import { DataMapper } from "../utils/mappers";
import { useAuth } from "@/hooks/useAuth";

interface DataContextType {
  parkingSpots: ParkingSpot[];
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  addParkingSpot: (spot: Omit<ParkingSpot, "id" | "status">) => Promise<void>;
  updateParkingSpot: (id: string, updates: Partial<ParkingSpot>) => Promise<void>;
  deleteParkingSpot: (id: string) => Promise<void>;
  createReservation: (reservation: Omit<Reservation, "id" | "status" | "entryTime" | "exitTime" | "totalCost">) => Promise<string>;
  cancelReservation: (id: string) => Promise<void>;
  completeReservation: (id: string) => Promise<void>;
  registerEntry: (reservationId: string) => Promise<void>;
  registerExit: (reservationId: string) => Promise<number>;
  getUserReservations: (userId: string) => Promise<Reservation[]>;
  getSpotsByOwner: (ownerId: string) => Promise<ParkingSpot[]>;
  getUserActiveReservationCount: (userId: string) => Promise<number>;
  getIncomeReport: (filter: ReportFilter, ownerId: string) => Promise<Income[]>;
  generateTicket: (reservationId: string) => Promise<TicketInfo | null>;
  calculateEstimatedCost: (estimatedEntryTime: Date, estimatedExitTime: Date, hourlyRate: number) => number;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export { DataContext };

export function DataProvider({ children }: { children: ReactNode }) {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Función para calcular costo estimado de manera consistente
  const calculateEstimatedCost = useCallback((
    estimatedEntryTime: Date,
    estimatedExitTime: Date,
    hourlyRate: number
  ): number => {
    // Asegurar que tengamos objetos Date válidos
    const entryTime = new Date(estimatedEntryTime);
    const exitTime = new Date(estimatedExitTime);
    
    const estimatedHours = 
      (exitTime.getTime() - entryTime.getTime()) / 
      (1000 * 60 * 60);
    
    const result = Math.ceil(Math.max(1, estimatedHours) * hourlyRate); // Mínimo 1 hora
    
    return result;
  }, []);

  // Función para manejar errores
  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                   (error as { message?: string })?.message || 
                   defaultMessage;
    setError(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Cargar estacionamientos
      const estacionamientosData = await estacionamientoService.getAllEstacionamientos();
      const mappedSpots = estacionamientosData.map(est => DataMapper.estacionamientoToParkingSpot(est));
      setParkingSpots(mappedSpots);

      // Cargar reservas del usuario
      const reservasData = await reservaService.getReservasByUser(parseInt(currentUser.id));
      const mappedReservations = reservasData.map(res => DataMapper.ticketToReservation(res));
      setReservations(mappedReservations);
    } catch (err) {
      handleError(err, "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [currentUser, handleError]);

  // Cargar datos iniciales  
  useEffect(() => {
    if (currentUser) {
      refreshData();
    } else {
      setParkingSpots([]);
      setReservations([]);
      setLoading(false);
    }
  }, [currentUser, refreshData]);

  const addParkingSpot = async (spot: Omit<ParkingSpot, "id" | "status">) => {
    try {
      setLoading(true);
      const spotWithDefaults: ParkingSpot = {
        ...spot,
        id: "0", // Temporal, se reemplazará por el ID del backend
        status: "available"
      };
      const backendSpot = DataMapper.parkingSpotToEstacionamiento(spotWithDefaults);
      
      const newSpot = await estacionamientoService.createEstacionamiento(backendSpot);
      const mappedSpot = DataMapper.estacionamientoToParkingSpot(newSpot);
      
      setParkingSpots(prev => [...prev, mappedSpot]);
      toast({
        title: "Plaza agregada",
        description: `La plaza ${mappedSpot.name} ha sido agregada exitosamente`
      });
    } catch (err) {
      handleError(err, "Error al agregar la plaza");
    } finally {
      setLoading(false);
    }
  };

  const updateParkingSpot = async (id: string, updates: Partial<ParkingSpot>) => {
    try {
      setLoading(true);
      const currentSpot = parkingSpots.find(spot => spot.id === id);
      if (!currentSpot) throw new Error("Plaza no encontrada");
      
      const updatedSpot = { ...currentSpot, ...updates };
      const backendSpot = DataMapper.parkingSpotToEstacionamiento(updatedSpot);
      
      const updated = await estacionamientoService.updateEstacionamiento(parseInt(id), backendSpot);
      const mappedSpot = DataMapper.estacionamientoToParkingSpot(updated);
      
      setParkingSpots(prev => prev.map(spot => spot.id === id ? mappedSpot : spot));
      toast({
        title: "Plaza actualizada",
        description: "La plaza ha sido actualizada exitosamente"
      });
    } catch (err) {
      handleError(err, "Error al actualizar la plaza");
    } finally {
      setLoading(false);
    }
  };

  const deleteParkingSpot = async (id: string) => {
    try {
      // Verificar si tiene reservas activas
      const hasActiveReservations = reservations.some(
        r => r.spotId === id && (r.status === "active" || r.status === "pending")
      );
      
      if (hasActiveReservations) {
        toast({
          title: "No se puede eliminar",
          description: "Esta plaza tiene reservaciones activas o pendientes",
          variant: "destructive"
        });
        return;
      }
      
      setLoading(true);
      await estacionamientoService.deleteEstacionamiento(parseInt(id));
      
      setParkingSpots(prev => prev.filter(spot => spot.id !== id));
      toast({
        title: "Plaza eliminada",
        description: "La plaza ha sido eliminada exitosamente"
      });
    } catch (err) {
      handleError(err, "Error al eliminar la plaza");
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: Omit<Reservation, "id" | "status" | "entryTime" | "exitTime" | "totalCost">): Promise<string> => {
    try {
      setLoading(true);
      
      // Verificar límite de reservas activas (aumentado para permitir más flexibilidad)
      const userActiveCount = await getUserActiveReservationCount(reservationData.userId);
      if (userActiveCount >= 10) { // Aumentado de 3 a 10
        toast({
          title: "Límite de reservaciones",
          description: "No puedes tener más de 10 reservaciones activas",
          variant: "destructive"
        });
        return "";
      }
      
      // Verificar disponibilidad de la plaza
      const spot = parkingSpots.find(s => s.id === reservationData.spotId);
      if (!spot || spot.status !== "available") {
        toast({
          title: "Plaza no disponible",
          description: "La plaza seleccionada no está disponible",
          variant: "destructive"
        });
        return "";
      }
      
      // Crear request para el backend
      const createRequest = {
        usuario_id: parseInt(reservationData.userId),
        estacionamiento_id: parseInt(reservationData.spotId),
        vehiculo_id: reservationData.licensePlate, // Placa del vehículo
        tipo_reserva: 'por_horas' as const,
        fecha_entrada: reservationData.estimatedEntryTime.toISOString(), // ✅ Enviar fecha de entrada estimada
        fecha_salida_estimada: reservationData.estimatedExitTime.toISOString(), // ✅ Enviar fecha de salida estimada
        horas_estimadas: Math.ceil(
          (reservationData.estimatedExitTime.getTime() - reservationData.estimatedEntryTime.getTime()) / 
          (1000 * 60 * 60)
        )
      };
      
      const reservaResponse = await reservaService.crearReserva(createRequest);
      
      // Crear reservation local basada en la respuesta
      const mappedReservation: Reservation = {
        id: reservaResponse.ticket.id.toString(),
        userId: reservationData.userId,
        spotId: reservationData.spotId,
        licensePlate: reservationData.licensePlate,
        estimatedEntryTime: reservationData.estimatedEntryTime,
        estimatedExitTime: reservationData.estimatedExitTime,
        status: "pending",
        entryTime: null,
        exitTime: null,
        totalCost: null
      };
      
      setReservations(prev => [...prev, mappedReservation]);
      
      // Actualizar estado de la plaza
      await updateParkingSpot(reservationData.spotId, { status: "reserved" });
      
      toast({
        title: "Reservación creada",
        description: "Tu reservación ha sido creada exitosamente"
      });
      
      return mappedReservation.id;
    } catch (err) {
      handleError(err, "Error al crear la reservación");
      return "";
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      setLoading(true);
      
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) {
        toast({
          title: "Error",
          description: "Reservación no encontrada",
          variant: "destructive"
        });
        return;
      }
      
      await reservaService.cancelarReserva(parseInt(id));
      
      // Actualizar estado local
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status: "cancelled" } : r
      ));
      
      // Actualizar estado de la plaza
      await updateParkingSpot(reservation.spotId, { status: "available" });
      
      toast({
        title: "Reservación cancelada",
        description: "La reservación ha sido cancelada exitosamente"
      });
    } catch (err) {
      handleError(err, "Error al cancelar la reservación");
    } finally {
      setLoading(false);
    }
  };

  const completeReservation = async (id: string) => {
    try {
      setLoading(true);
      
      // Por ahora, simplemente actualizar el estado local
      // En el futuro, podría haber un endpoint específico para completar reservas
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status: "completed" } : r
      ));
      
      toast({
        title: "Reservación completada",
        description: "La reservación ha sido completada exitosamente"
      });
    } catch (err) {
      handleError(err, "Error al completar la reservación");
    } finally {
      setLoading(false);
    }
  };

  const registerEntry = async (reservationId: string) => {
    try {
      setLoading(true);
      
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) {
        toast({
          title: "Error",
          description: "Reservación no encontrada",
          variant: "destructive"
        });
        return;
      }
      
      // Por ahora, simular el registro de entrada
      // En el futuro, podría haber un endpoint específico para esto
      
      // Actualizar estado local
      setReservations(prev => prev.map(r => 
        r.id === reservationId ? { ...r, entryTime: new Date(), status: "active" } : r
      ));
      
      // Actualizar estado de la plaza
      await updateParkingSpot(reservation.spotId, { status: "occupied" });
      
      toast({
        title: "Entrada registrada",
        description: "Se ha registrado la entrada correctamente"
      });
    } catch (err) {
      handleError(err, "Error al registrar la entrada");
    } finally {
      setLoading(false);
    }
  };

  const registerExit = async (reservationId: string): Promise<number> => {
    try {
      setLoading(true);
      
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation || !reservation.entryTime) {
        toast({
          title: "Error",
          description: "No se puede registrar la salida de esta reservación",
          variant: "destructive"
        });
        return 0;
      }
      
      // Usar el servicio para finalizar la reserva
      const exitData = await reservaService.finalizarReserva(parseInt(reservationId), {
        metodo_pago: 'efectivo'
      });
      
      const cost = exitData.pago.monto;
      
      // Actualizar estado local
      setReservations(prev => prev.map(r => 
        r.id === reservationId ? { 
          ...r, 
          exitTime: new Date(), 
          totalCost: cost, 
          status: "completed" 
        } : r
      ));
      
      // Actualizar estado de la plaza
      await updateParkingSpot(reservation.spotId, { status: "available" });
      
      sonnerToast("Salida registrada", {
        description: `Monto a pagar: ${CURRENCY.symbol}${cost.toLocaleString()} ${CURRENCY.code}`,
        icon: <DollarSign className="text-green-500" />
      });
      
      return cost;
    } catch (err) {
      handleError(err, "Error al registrar la salida");
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const getUserReservations = async (userId: string): Promise<Reservation[]> => {
    try {
      const reservasData = await reservaService.getReservasByUser(parseInt(userId));
      return reservasData.map(res => DataMapper.ticketToReservation(res));
    } catch (err) {
      handleError(err, "Error al obtener las reservaciones");
      return [];
    }
  };

  const getSpotsByOwner = async (ownerId: string): Promise<ParkingSpot[]> => {
    try {
      const estacionamientosData = await estacionamientoService.getAllEstacionamientos();
      return estacionamientosData
        .filter(est => est.id.toString() === ownerId) // Filtrar por propietario si es necesario
        .map(est => DataMapper.estacionamientoToParkingSpot(est));
    } catch (err) {
      handleError(err, "Error al obtener las plazas");
      return [];
    }
  };

  const getUserActiveReservationCount = async (userId: string): Promise<number> => {
    try {
      const reservasData = await reservaService.getReservasByUser(parseInt(userId));
      return reservasData.filter(
        r => r.estado === "activo"
      ).length;
    } catch (err) {
      handleError(err, "Error al contar las reservaciones activas");
      return 0;
    }
  };

  const getIncomeReport = async (filter: ReportFilter, ownerId: string): Promise<Income[]> => {
    try {
      console.log('Obteniendo reporte de ingresos con filtros:', filter, 'para owner:', ownerId);
      
      // Usar el nuevo servicio de reportes que llama al endpoint del backend
      const incomeData = await reportesService.getIncomeReport(filter, ownerId);
      
      console.log('Reporte de ingresos obtenido:', incomeData);
      return incomeData;
      
    } catch (err) {
      console.error('Error al obtener reporte de ingresos:', err);
      handleError(err, "Error al obtener el reporte de ingresos");
      
      // Fallback a implementación temporal si el endpoint falla
      return await getIncomeReportFallback(filter, ownerId);
    }
  };

  // Implementación temporal como fallback
  const getIncomeReportFallback = async (filter: ReportFilter, ownerId: string): Promise<Income[]> => {
    try {
      console.log('Usando implementación temporal como fallback');
      
      // Obtener todas las reservas del usuario
      const userReservations = await getUserReservations(ownerId);
      
      // Filtrar reservas completadas y pagadas en el rango de fechas
      const filteredReservations = userReservations.filter(reservation => {
        if (reservation.status !== 'completed') return false;
        if (!reservation.totalCost) return false;
        
        // Usar estimatedEntryTime para el filtro de fecha si no hay entryTime
        const reservationDate = reservation.entryTime || reservation.estimatedEntryTime;
        const date = new Date(reservationDate);
        
        return date >= filter.startDate && date <= filter.endDate;
      });
      
      // Agrupar por día
      const groupedByDay: Record<string, { amount: number; count: number }> = {};
      
      filteredReservations.forEach(reservation => {
        const date = reservation.entryTime || reservation.estimatedEntryTime;
        const dayKey = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!groupedByDay[dayKey]) {
          groupedByDay[dayKey] = { amount: 0, count: 0 };
        }
        
        groupedByDay[dayKey].amount += reservation.totalCost || 0;
        groupedByDay[dayKey].count += 1;
      });
      
      // Convertir a array de Income
      const incomeData: Income[] = Object.entries(groupedByDay).map(([dateStr, data]) => ({
        date: new Date(dateStr),
        amount: data.amount,
        reservationCount: data.count
      }));
      
      // Ordenar por fecha
      incomeData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      return incomeData;
      
    } catch (err) {
      console.error('Error en fallback:', err);
      return [];
    }
  };

  const generateTicket = async (reservationId: string): Promise<TicketInfo | null> => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return null;
      
      const spot = parkingSpots.find(s => s.id === reservation.spotId);
      if (!spot) return null;
      
      // Usar función utilitaria para calcular costo estimado
      const estimatedCost = calculateEstimatedCost(
        reservation.estimatedEntryTime,
        reservation.estimatedExitTime,
        spot.hourlyRate
      );
      
      return {
        reservationId: reservation.id,
        userName: currentUser?.name || "Usuario",
        licensePlate: reservation.licensePlate,
        spotName: spot.name,
        entryTime: reservation.entryTime,
        estimatedEntryTime: reservation.estimatedEntryTime,
        estimatedExitTime: reservation.estimatedExitTime,
        estimatedCost
      };
    } catch (err) {
      handleError(err, "Error al generar el ticket");
      return null;
    }
  };

  const value = {
    parkingSpots,
    reservations,
    loading,
    error,
    addParkingSpot,
    updateParkingSpot,
    deleteParkingSpot,
    createReservation,
    cancelReservation,
    completeReservation,
    registerEntry,
    registerExit,
    getUserReservations,
    getSpotsByOwner,
    getUserActiveReservationCount,
    getIncomeReport,
    generateTicket,
    calculateEstimatedCost,
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// CORRECION_INCONSISTENCIA_COSTOS_COMPLETADA.md:
// ✅ Se corrigió la inconsistencia entre ReservationCard y TicketModal
// ✅ calculateEstimatedCost expuesto en el contexto y usado en ambos componentes
// ✅ Lógica unificada para cálculo de costos estimados
// ✅ Etiquetas dinámicas: "Costo total" vs "Costo estimado"
