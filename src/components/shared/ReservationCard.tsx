
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reservation, ParkingSpot } from '@/types';

interface ReservationCardProps {
  reservation: Reservation;
  spot: ParkingSpot;
  onCancel?: () => void;
  onRegisterEntry?: () => void;
  onRegisterExit?: () => void;
  onViewTicket?: () => void;
}

export default function ReservationCard({
  reservation,
  spot,
  onCancel,
  onRegisterEntry,
  onRegisterExit,
  onViewTicket
}: ReservationCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'No registrado';
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    switch (reservation.status) {
      case 'pending':
        return 'bg-parking-warning text-black';
      case 'active':
        return 'bg-parking-secondary text-white';
      case 'completed':
        return 'bg-parking-success text-white';
      case 'cancelled':
        return 'bg-parking-danger text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = () => {
    switch (reservation.status) {
      case 'pending':
        return 'Pendiente';
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return reservation.status;
    }
  };

  const canCancel = reservation.status === 'pending';
  const canRegisterEntry = reservation.status === 'pending';
  const canRegisterExit = reservation.status === 'active';
  const canViewTicket = reservation.status !== 'cancelled';

  return (
    <Card className="h-full flex flex-col border-2 hover:shadow-lg transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">
            Plaza: {spot.name}
          </CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-2 flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Placa:</span>
            <span className="font-medium">{reservation.licensePlate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entrada estimada:</span>
            <span className="font-medium">{formatDate(reservation.estimatedEntryTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Salida estimada:</span>
            <span className="font-medium">{formatDate(reservation.estimatedExitTime)}</span>
          </div>
          {reservation.entryTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada real:</span>
              <span className="font-medium">{formatDate(reservation.entryTime)}</span>
            </div>
          )}
          {reservation.exitTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Salida real:</span>
              <span className="font-medium">{formatDate(reservation.exitTime)}</span>
            </div>
          )}
          {reservation.totalCost !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo total:</span>
              <span className="font-medium">${reservation.totalCost.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex flex-wrap gap-2">
        {canCancel && onCancel && (
          <Button 
            variant="destructive" 
            className="flex-1" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}
        {canRegisterEntry && onRegisterEntry && (
          <Button 
            className="flex-1 bg-parking-secondary hover:bg-parking-primary" 
            onClick={onRegisterEntry}
          >
            Registrar Entrada
          </Button>
        )}
        {canRegisterExit && onRegisterExit && (
          <Button 
            className="flex-1 bg-parking-success hover:bg-green-700" 
            onClick={onRegisterExit}
          >
            Registrar Salida
          </Button>
        )}
        {canViewTicket && onViewTicket && (
          <Button 
            variant="outline" 
            className="flex-1 border-parking-secondary text-parking-secondary hover:text-parking-secondary" 
            onClick={onViewTicket}
          >
            Ver Ticket
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
