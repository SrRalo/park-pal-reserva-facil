
import React, { createContext, useState, useContext, ReactNode } from "react";
import { ParkingSpot, Reservation, Income, ReportFilter, TicketInfo } from "../types";
import { parkingSpots as initialSpots, reservations as initialReservations, incomeData } from "../data/mockData";
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  parkingSpots: ParkingSpot[];
  reservations: Reservation[];
  addParkingSpot: (spot: Omit<ParkingSpot, "id" | "status">) => void;
  updateParkingSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  deleteParkingSpot: (id: string) => void;
  createReservation: (reservation: Omit<Reservation, "id" | "status" | "entryTime" | "exitTime" | "totalCost">) => string;
  cancelReservation: (id: string) => void;
  completeReservation: (id: string) => void;
  registerEntry: (reservationId: string) => void;
  registerExit: (reservationId: string) => number;
  getUserReservations: (userId: string) => Reservation[];
  getSpotsByOwner: (ownerId: string) => ParkingSpot[];
  getUserActiveReservationCount: (userId: string) => number;
  getIncomeReport: (filter: ReportFilter, ownerId: string) => Income[];
  generateTicket: (reservationId: string) => TicketInfo | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>(initialSpots);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const { toast } = useToast();

  const addParkingSpot = (spot: Omit<ParkingSpot, "id" | "status">) => {
    const newSpot: ParkingSpot = {
      ...spot,
      id: `p${parkingSpots.length + 1}`,
      status: "available"
    };
    setParkingSpots([...parkingSpots, newSpot]);
    toast({
      title: "Plaza agregada",
      description: `La plaza ${newSpot.name} ha sido agregada exitosamente`
    });
  };

  const updateParkingSpot = (id: string, updates: Partial<ParkingSpot>) => {
    setParkingSpots(spots => 
      spots.map(spot => 
        spot.id === id ? { ...spot, ...updates } : spot
      )
    );
    toast({
      title: "Plaza actualizada",
      description: "La plaza ha sido actualizada exitosamente"
    });
  };

  const deleteParkingSpot = (id: string) => {
    // Check if spot has active reservations
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
    
    setParkingSpots(spots => spots.filter(spot => spot.id !== id));
    toast({
      title: "Plaza eliminada",
      description: "La plaza ha sido eliminada exitosamente"
    });
  };

  const createReservation = (reservationData: Omit<Reservation, "id" | "status" | "entryTime" | "exitTime" | "totalCost">) => {
    // Check user's active reservation count
    const userActiveReservations = getUserActiveReservationCount(reservationData.userId);
    
    if (userActiveReservations >= 3) {
      toast({
        title: "Límite de reservaciones",
        description: "No puedes tener más de 3 reservaciones activas",
        variant: "destructive"
      });
      return "";
    }
    
    // Check if spot is available
    const spot = parkingSpots.find(s => s.id === reservationData.spotId);
    if (!spot || spot.status !== "available") {
      toast({
        title: "Plaza no disponible",
        description: "La plaza seleccionada no está disponible",
        variant: "destructive"
      });
      return "";
    }
    
    // Create reservation
    const newReservation: Reservation = {
      id: `r${reservations.length + 1}`,
      ...reservationData,
      status: "pending",
      entryTime: null,
      exitTime: null,
      totalCost: null
    };
    
    setReservations([...reservations, newReservation]);
    
    // Update spot status
    updateParkingSpot(reservationData.spotId, { status: "reserved" });
    
    toast({
      title: "Reservación creada",
      description: "Tu reservación ha sido creada exitosamente"
    });
    
    return newReservation.id;
  };

  const cancelReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) {
      toast({
        title: "Error",
        description: "Reservación no encontrada",
        variant: "destructive"
      });
      return;
    }
    
    // Update reservation status
    setReservations(prevReservations => 
      prevReservations.map(r => 
        r.id === id ? { ...r, status: "cancelled" } : r
      )
    );
    
    // Update spot status
    const spot = parkingSpots.find(s => s.id === reservation.spotId);
    if (spot) {
      updateParkingSpot(reservation.spotId, { status: "available" });
    }
    
    toast({
      title: "Reservación cancelada",
      description: "La reservación ha sido cancelada exitosamente"
    });
  };

  const completeReservation = (id: string) => {
    setReservations(prevReservations => 
      prevReservations.map(r => 
        r.id === id ? { ...r, status: "completed" } : r
      )
    );
  };

  const registerEntry = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) {
      toast({
        title: "Error",
        description: "Reservación no encontrada",
        variant: "destructive"
      });
      return;
    }
    
    // Update reservation with entry time and status
    setReservations(prevReservations => 
      prevReservations.map(r => 
        r.id === reservationId ? { ...r, entryTime: new Date(), status: "active" } : r
      )
    );
    
    // Update spot status
    updateParkingSpot(reservation.spotId, { status: "occupied" });
    
    toast({
      title: "Entrada registrada",
      description: "Se ha registrado la entrada correctamente"
    });
  };

  const registerExit = (reservationId: string): number => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation || !reservation.entryTime) {
      toast({
        title: "Error",
        description: "No se puede registrar la salida de esta reservación",
        variant: "destructive"
      });
      return 0;
    }
    
    // Calculate total time in hours
    const exitTime = new Date();
    const entryTime = new Date(reservation.entryTime);
    const timeInHours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
    
    // Get spot hourly rate
    const spot = parkingSpots.find(s => s.id === reservation.spotId);
    if (!spot) {
      toast({
        title: "Error",
        description: "Plaza no encontrada",
        variant: "destructive"
      });
      return 0;
    }
    
    // Calculate total cost
    const cost = Math.ceil(timeInHours * spot.hourlyRate);
    
    // Update reservation
    setReservations(prevReservations => 
      prevReservations.map(r => 
        r.id === reservationId ? { ...r, exitTime, totalCost: cost, status: "completed" } : r
      )
    );
    
    // Update spot status
    updateParkingSpot(reservation.spotId, { status: "available" });
    
    toast({
      title: "Salida registrada",
      description: `Monto a pagar: ${cost.toLocaleString()} COP`
    });
    
    return cost;
  };

  const getUserReservations = (userId: string): Reservation[] => {
    return reservations.filter(r => r.userId === userId);
  };

  const getSpotsByOwner = (ownerId: string): ParkingSpot[] => {
    return parkingSpots.filter(s => s.ownerId === ownerId);
  };

  const getUserActiveReservationCount = (userId: string): number => {
    return reservations.filter(
      r => r.userId === userId && (r.status === "pending" || r.status === "active")
    ).length;
  };

  const getIncomeReport = (filter: ReportFilter, ownerId: string): Income[] => {
    // This is a mock function that would normally filter real data
    // For demo purposes, we'll return the mock income data
    return incomeData;
  };

  const generateTicket = (reservationId: string): TicketInfo | null => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return null;
    
    const spot = parkingSpots.find(s => s.id === reservation.spotId);
    if (!spot) return null;
    
    // Calculate estimated cost
    const estimatedHours = 
      (reservation.estimatedExitTime.getTime() - reservation.estimatedEntryTime.getTime()) / 
      (1000 * 60 * 60);
    
    const estimatedCost = Math.ceil(estimatedHours * spot.hourlyRate);
    
    return {
      reservationId: reservation.id,
      userName: "Usuario", // In a real app, we would get this from user data
      licensePlate: reservation.licensePlate,
      spotName: spot.name,
      entryTime: reservation.entryTime,
      estimatedEntryTime: reservation.estimatedEntryTime,
      estimatedExitTime: reservation.estimatedExitTime,
      estimatedCost
    };
  };

  const value = {
    parkingSpots,
    reservations,
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
    generateTicket
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
