
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ParkingSpot, CURRENCY } from '@/types';
import { DollarSign } from 'lucide-react';

interface SpotCardProps {
  spot: ParkingSpot;
  onReserve?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isRegistrador?: boolean;
}

export default function SpotCard({ 
  spot, 
  onReserve, 
  onEdit, 
  onDelete, 
  isRegistrador = false 
}: SpotCardProps) {
  const getStatusColor = () => {
    switch (spot.status) {
      case 'available':
        return 'bg-parking-success text-white';
      case 'occupied':
        return 'bg-parking-danger text-white';
      case 'reserved':
        return 'bg-parking-warning text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = () => {
    switch (spot.status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupado';
      case 'reserved':
        return 'Reservado';
      default:
        return spot.status;
    }
  };

  return (
    <Card className="h-full flex flex-col border-2 hover:shadow-lg transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">{spot.name}</CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ubicación:</span>
            <span className="font-medium">{spot.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tarifa:</span>
            <span className="font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {spot.hourlyRate.toLocaleString()}/{CURRENCY.code}/hora
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium">{spot.type}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {isRegistrador ? (
          <div className="flex space-x-2 w-full">
            {onEdit && (
              <Button 
                variant="outline" 
                className="flex-1 border-parking-secondary text-parking-secondary hover:text-parking-secondary" 
                onClick={onEdit}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="destructive" 
                className="flex-1" 
                onClick={onDelete}
              >
                Eliminar
              </Button>
            )}
          </div>
        ) : (
          onReserve && spot.status === 'available' && (
            <Button 
              className="w-full bg-parking-secondary hover:bg-parking-primary" 
              onClick={onReserve}
            >
              Reservar
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
