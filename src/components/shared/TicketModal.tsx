
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TicketInfo } from '@/types';

interface TicketModalProps {
  ticket: TicketInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketModal({ ticket, isOpen, onClose }: TicketModalProps) {
  if (!ticket) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-parking-primary">
            Ticket de Reservación
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-1">ParkSmart</h3>
              <p className="text-sm text-muted-foreground">Sistema de Gestión de Estacionamiento</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Ticket #:</span>
                <span>{ticket.reservationId}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="font-medium">Cliente:</span>
                <span>{ticket.userName}</span>
              </div>
              
              {ticket.fiscalId && (
                <div className="flex justify-between">
                  <span className="font-medium">NIF/RUT:</span>
                  <span>{ticket.fiscalId}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-medium">Placa:</span>
                <span>{ticket.licensePlate}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="font-medium">Plaza:</span>
                <span>{ticket.spotName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Entrada estimada:</span>
                <span>{formatDate(ticket.estimatedEntryTime)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Salida estimada:</span>
                <span>{formatDate(ticket.estimatedExitTime)}</span>
              </div>
              
              {ticket.entryTime && (
                <div className="flex justify-between">
                  <span className="font-medium">Entrada real:</span>
                  <span>{formatDate(ticket.entryTime)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="font-medium">Costo estimado:</span>
                <span className="text-parking-primary font-bold">${ticket.estimatedCost.toLocaleString()}</span>
              </div>
              
              <div className="text-center text-xs mt-4 text-muted-foreground">
                <p>El costo final se calculará al momento de salida</p>
                <p>basado en el tiempo real de uso.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              className="w-full bg-parking-secondary hover:bg-parking-primary" 
              onClick={() => window.print()}
            >
              Imprimir Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
