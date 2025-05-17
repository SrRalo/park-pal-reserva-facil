
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import ReservationCard from '@/components/shared/ReservationCard';
import TicketModal from '@/components/shared/TicketModal';
import { Reservation, ParkingSpot, TicketInfo } from '@/types';

const ReservadorReservations = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { 
    getUserReservations, 
    parkingSpots, 
    cancelReservation,
    generateTicket
  } = useData();
  
  const [selectedTab, setSelectedTab] = useState("active");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<TicketInfo | null>(null);
  
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
  
  // Get user's reservations
  const userReservations = getUserReservations(currentUser.id);
  
  // Filter reservations by status
  const activeReservations = userReservations.filter(
    res => res.status === 'active' || res.status === 'pending'
  );
  
  const pastReservations = userReservations.filter(
    res => res.status === 'completed' || res.status === 'cancelled'
  );
  
  // Get spot details for a reservation
  const getSpotForReservation = (reservation: Reservation): ParkingSpot => {
    return parkingSpots.find(spot => spot.id === reservation.spotId) || {
      id: 'unknown',
      name: 'Desconocida',
      location: 'Desconocida',
      hourlyRate: 0,
      type: 'Desconocida',
      status: 'available',
      ownerId: '',
    };
  };
  
  // Handle view ticket
  const handleViewTicket = (reservationId: string) => {
    const ticket = generateTicket(reservationId);
    if (ticket) {
      setCurrentTicket(ticket);
      setIsTicketModalOpen(true);
    }
  };
  
  return (
    <MainLayout title="Mis Reservaciones" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Mis Reservaciones</h2>
            <p className="text-gray-600">
              Administre sus reservaciones activas y vea el historial
            </p>
          </div>
          
          <Button 
            className="bg-parking-secondary hover:bg-parking-primary"
            onClick={() => navigate('/reservador/search')}
          >
            Buscar Plazas
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="active">
              Activas ({activeReservations.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Historial ({pastReservations.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Active Reservations Tab */}
          <TabsContent value="active" className="mt-6">
            {activeReservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    spot={getSpotForReservation(reservation)}
                    onCancel={() => cancelReservation(reservation.id)}
                    onViewTicket={() => handleViewTicket(reservation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-medium text-gray-600 mb-4">
                  No tiene reservaciones activas
                </p>
                <p className="text-gray-500 mb-6">
                  Puede reservar hasta 3 plazas de forma simultánea
                </p>
                <Button 
                  className="bg-parking-secondary hover:bg-parking-primary"
                  onClick={() => navigate('/reservador/search')}
                >
                  Buscar Plazas Disponibles
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            {pastReservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    spot={getSpotForReservation(reservation)}
                    onViewTicket={() => handleViewTicket(reservation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-medium text-gray-600 mb-4">
                  No tiene historial de reservaciones
                </p>
                <p className="text-gray-500">
                  Sus reservaciones completadas y canceladas aparecerán aquí
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Ticket Modal */}
      <TicketModal 
        ticket={currentTicket} 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />
    </MainLayout>
  );
};

export default ReservadorReservations;
