
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import MainLayout from '@/components/layout/MainLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { parkingSpots, reservations, getUserReservations, getSpotsByOwner, getUserActiveReservationCount } = useData();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!currentUser) {
    return null; // Don't render anything while checking auth
  }
  
  const isRegistrador = currentUser.role === 'registrador';
  
  // Get data based on user role
  const userSpots = isRegistrador ? getSpotsByOwner(currentUser.id) : [];
  const userReservations = !isRegistrador ? getUserReservations(currentUser.id) : [];
  const activeReservationCount = !isRegistrador ? getUserActiveReservationCount(currentUser.id) : 0;
  
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
          
          {isRegistrador ? (
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-parking-secondary hover:bg-parking-primary"
                onClick={() => navigate('/registrador/spots')}
              >
                Administrar Plazas
              </Button>
              <Button 
                variant="outline"
                className="border-parking-secondary text-parking-secondary hover:text-parking-secondary"
                onClick={() => navigate('/registrador/reports')}
              >
                Ver Reportes
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-parking-secondary hover:bg-parking-primary"
                onClick={() => navigate('/reservador/search')}
              >
                Buscar Plazas
              </Button>
              <Button 
                variant="outline"
                className="border-parking-secondary text-parking-secondary hover:text-parking-secondary"
                onClick={() => navigate('/reservador/reservations')}
              >
                Mis Reservaciones
              </Button>
            </div>
          )}
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isRegistrador ? (
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
                  <CardTitle className="text-lg">Total Plazas</CardTitle>
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
        
        {/* Quick Actions Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Acciones Rápidas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isRegistrador ? (
              <>
                <Card className="border-2 hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">Administrar Plazas</CardTitle>
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
                    <CardTitle className="text-lg">Ver Reportes</CardTitle>
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
      </div>
    </MainLayout>
  );
};

export default Dashboard;
