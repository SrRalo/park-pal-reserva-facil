
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import SpotCard from '@/components/shared/SpotCard';
import ReservationForm from '@/components/forms/ReservationForm';
import { ParkingSpot } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ReservadorSearch = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { parkingSpots, createReservation } = useData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState('name');
  const [openReserveDialog, setOpenReserveDialog] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  
  // Redirect if not authenticated or not a reservador
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'reservador') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  if (!currentUser || currentUser.role !== 'reservador') {
    return null;
  }
  
  // Filter spots - show only available ones
  const availableSpots = parkingSpots.filter(spot => spot.status === 'available');
  
  // Apply additional filters
  const filteredSpots = availableSpots.filter(spot => {
    // Text search
    const matchesSearch = 
      spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = !filterType || spot.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Get unique spot types for the filter dropdown
  const spotTypes = [...new Set(parkingSpots.map(spot => spot.type))];
  
  // Sort spots
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'location':
        return a.location.localeCompare(b.location);
      case 'price-low':
        return a.hourlyRate - b.hourlyRate;
      case 'price-high':
        return b.hourlyRate - a.hourlyRate;
      default:
        return 0;
    }
  });
  
  // Handle reservation submission
  const handleReserveSpot = (data: any) => {
    if (!selectedSpot) return;
    
    // Create reservation with the form data
    const reservationId = createReservation({
      userId: currentUser.id,
      spotId: selectedSpot.id,
      estimatedEntryTime: data.estimatedEntryTime,
      estimatedExitTime: data.estimatedExitTime,
      licensePlate: data.licensePlate
    });
    
    setOpenReserveDialog(false);
    setSelectedSpot(null);
    
    if (reservationId) {
      toast({
        title: "Reservación Exitosa",
        description: "Se ha creado su reservación correctamente"
      });
      
      // Redirect to reservations page
      navigate('/reservador/reservations');
    }
  };
  
  return (
    <MainLayout title="Buscar Plazas" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header section */}
        <div>
          <h2 className="text-2xl font-bold">Plazas Disponibles</h2>
          <p className="text-gray-600">
            Busque y reserve plazas de estacionamiento disponibles
          </p>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Input
              type="text"
              placeholder="Buscar por nombre, ubicación o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Select
              value={filterType || ""}
              onValueChange={(value) => setFilterType(value || undefined)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo de Plaza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {spotTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="location">Ubicación</SelectItem>
                <SelectItem value="price-low">Precio (menor)</SelectItem>
                <SelectItem value="price-high">Precio (mayor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {sortedSpots.length} plazas disponibles
        </div>
        
        {/* Spots grid */}
        {sortedSpots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onReserve={() => {
                  setSelectedSpot(spot);
                  setOpenReserveDialog(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl font-medium text-gray-600 mb-4">
              No hay plazas disponibles
            </p>
            <p className="text-gray-500">
              No se encontraron plazas disponibles que coincidan con los criterios de búsqueda.
              <br />
              Pruebe con otros filtros o vuelva más tarde.
            </p>
          </div>
        )}
      </div>
      
      {/* Reservation Dialog */}
      <Dialog open={openReserveDialog} onOpenChange={setOpenReserveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar Plaza</DialogTitle>
          </DialogHeader>
          {selectedSpot && (
            <ReservationForm
              spot={selectedSpot}
              onSubmit={handleReserveSpot}
              onCancel={() => setOpenReserveDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ReservadorSearch;
