
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
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
    generateTicket,
    loading 
  } = useData();
  
  const [selectedTab, setSelectedTab] = useState("active");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<TicketInfo | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Redirect if not authenticated or not a reservador
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'reservador') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Cargar reservaciones del usuario
  useEffect(() => {
    const loadUserReservations = async () => {
      if (!currentUser) return;
      
      setDataLoading(true);
      try {
        const reservations = await getUserReservations(currentUser.id);
        setUserReservations(reservations);
      } catch (error) {
        console.error('Error loading user reservations:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadUserReservations();
  }, [currentUser, getUserReservations]);
  
  if (!currentUser || currentUser.role !== 'reservador') {
    return null;
  }
  
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
  const handleViewTicket = async (reservationId: string) => {
    try {
      const ticket = await generateTicket(reservationId);
      if (ticket) {
        setCurrentTicket(ticket);
        setIsTicketModalOpen(true);
      }
    } catch (error) {
      console.error('Error generating ticket:', error);
    }
  };

  // Handle cancel reservation
  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId);
      // Recargar reservaciones
      const updatedReservations = await getUserReservations(currentUser.id);
      setUserReservations(updatedReservations);
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };
  
  return (
    <MainLayout title="Mis Reservaciones" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Mis Reservaciones</h2>
          <Button 
            className="bg-parking-secondary hover:bg-parking-primary"
            onClick={() => navigate('/reservador/search')}
          >
            Nueva Reservación
          </Button>
        </div>

        {/* Loading State */}
        {(loading || dataLoading) && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parking-primary"></div>
            <span className="ml-2 text-parking-primary">Cargando reservaciones...</span>
          </div>
        )}

        {/* Content */}
        {!loading && !dataLoading && (
          <>
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
        </>
        )}
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
