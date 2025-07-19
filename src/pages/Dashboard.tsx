
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import MainLayout from '@/components/layout/MainLayout';
import { ParkingSpot, Reservation } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { parkingSpots, reservations, getUserReservations, getSpotsByOwner, getUserActiveReservationCount, loading } = useData();
  
  // Estados para datos asíncronos
  const [userSpots, setUserSpots] = useState<ParkingSpot[]>([]);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [activeReservationCount, setActiveReservationCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Calcular roles después del primer useEffect para evitar problemas
  const isAdmin = currentUser?.role === 'admin';
  const isRegistrador = currentUser?.role === 'registrador';
  const isReservador = currentUser?.role === 'reservador';
  
  // Admin y registrador tienen acceso a funcionalidades de administración
  const canManageSpots = isAdmin || isRegistrador;

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      setDataLoading(true);
      try {
        if (canManageSpots) {
          const spots = await getSpotsByOwner(currentUser.id);
          setUserSpots(spots);
        } else {
          const reservations = await getUserReservations(currentUser.id);
          const activeCount = await getUserActiveReservationCount(currentUser.id);
          setUserReservations(reservations);
          setActiveReservationCount(activeCount);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, getUserReservations, getSpotsByOwner, getUserActiveReservationCount, canManageSpots]);
  
  if (!currentUser) {
    return null; // Don't render anything while checking auth
  }
  
  // Calculate stats
  const availableSpots = parkingSpots.filter(spot => spot.status === 'available').length;
  const occupiedSpots = parkingSpots.filter(spot => spot.status === 'occupied').length;
  const reservedSpots = parkingSpots.filter(spot => spot.status === 'reserved').length;
  const pendingReservations = reservations.filter(res => res.status === 'pending').length;
  const activeReservations = reservations.filter(res => res.status === 'active').length;
  
  return (
    <MainLayout title="Dashboard" showLogout={true}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold">
            Bienvenido, {currentUser.name}
          </h2>
        </div>
        
        {/* Loading State */}
        {(loading || dataLoading) && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parking-primary"></div>
            <span className="ml-2 text-parking-primary">Cargando datos...</span>
          </div>
        )}
        
        {/* Stats Section */}
        {!loading && !dataLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {canManageSpots ? (
              <>
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Plazas Disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-success">{availableSpots}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Plazas Ocupadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-danger">{occupiedSpots}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Plazas Reservadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-warning">{reservedSpots}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {isAdmin ? 'Total Sistema' : 'Mis Plazas'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-primary">{parkingSpots.length}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Mis Reservaciones Activas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-secondary">{activeReservationCount}</p>
                    <p className="text-sm text-muted-foreground mt-1">Límite: 3 reservaciones</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Plazas Disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-success">{availableSpots}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Reservaciones Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-warning">{pendingReservations}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Reservaciones Activas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-parking-primary">{activeReservations}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
        
        {/* Quick Actions Section */}
        {!loading && !dataLoading && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Acciones Rápidas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {canManageSpots ? (
              <>
                {isAdmin ? (
                  // Admin specific dashboard
                  <>
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Administrar Plazas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Gestión global de todas las plazas del sistema.
                        </p>
                        <Button 
                          className="w-full bg-parking-secondary hover:bg-parking-primary" 
                          onClick={() => navigate('/admin/plazas')}
                        >
                          Gestión Global
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Reportes del Sistema</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Consulte reportes completos del sistema y estadísticas generales.
                        </p>
                        <Button 
                          className="w-full bg-parking-secondary hover:bg-parking-primary" 
                          onClick={() => navigate('/admin/reportes')}
                        >
                          Ver Reportes
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Nueva Plaza del Sistema</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Agregue una nueva plaza con sus características y tarifas.
                        </p>
                        <Button 
                          className="w-full bg-parking-secondary hover:bg-parking-primary" 
                          onClick={() => navigate('/admin/plazas/nueva')}
                        >
                          Añadir Plaza
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Gestión de Tickets</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Administre tickets, finalice reservaciones y gestione reportes.
                        </p>
                        <Button 
                          className="w-full bg-parking-secondary hover:bg-parking-primary" 
                          onClick={() => navigate('/admin/tickets')}
                        >
                          Gestionar Tickets
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Gestión de Usuarios</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Administre usuarios, roles y permisos del sistema.
                        </p>
                        <Button 
                          className="w-full bg-parking-primary hover:bg-parking-secondary" 
                          onClick={() => navigate('/admin/users')}
                        >
                          Gestionar Usuarios
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  // Registrador dashboard
                  <>
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Administrar Mis Plazas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Agregue, modifique o elimine plazas de estacionamiento.
                        </p>
                        <Button 
                          className="w-full bg-parking-secondary hover:bg-parking-primary" 
                          onClick={() => navigate('/registrador/spots')}
                        >
                          Ir a Plazas
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Mis Reportes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Consulte reportes de ingresos generados por sus plazas.
                        </p>
                        <Button 
                          className="w-full bg-parking-secondary hover:bg-parking-primary" 
                          onClick={() => navigate('/registrador/reports')}
                        >
                          Ver Reportes
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 hover:shadow-md transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">Añadir Nueva Plaza</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">
                          Agregue una nueva plaza con sus características y tarifas.
                        </p>
                        <Button 
                          className="w-full bg-parking-secondary hover:bg-parking-primary" 
                          onClick={() => navigate('/registrador/spots')}
                        >
                          Añadir Plaza
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            ) : (
              <>
                <Card className="border-2 hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">Buscar Plazas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Busque y reserve plazas disponibles para estacionar.
                    </p>
                    <Button 
                      className="w-full bg-parking-secondary hover:bg-parking-primary" 
                      onClick={() => navigate('/reservador/search')}
                    >
                      Buscar Ahora
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">Mis Reservaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Vea y administre sus reservaciones activas y pendientes.
                    </p>
                    <Button 
                      className="w-full bg-parking-secondary hover:bg-parking-primary" 
                      onClick={() => navigate('/reservador/reservations')}
                    >
                      Ver Reservaciones
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">Límite de Reservaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center my-2">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-bold">{activeReservationCount}/3</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      Puede tener hasta 3 reservaciones activas simultáneamente.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
