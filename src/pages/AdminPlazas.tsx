import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import MainLayout from '@/components/layout/MainLayout';
import { ParkingSpot } from '@/types';
import { Pencil, Trash2, Plus, MapPin, DollarSign } from 'lucide-react';

const AdminPlazas = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { parkingSpots, deleteParkingSpot, loading } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  // Filter parking spots
  const filteredSpots = parkingSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || spot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteSpot = async (spotId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta plaza?')) {
      try {
        await deleteParkingSpot(spotId);
      } catch (error) {
        console.error('Error al eliminar plaza:', error);
      }
    }
  };

  return (
    <MainLayout title="Administrar Plazas" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Administrar Plazas</h2>
            <p className="text-gray-600">
              Gestiona todas las plazas de estacionamiento del sistema
            </p>
          </div>
          <Button 
            onClick={() => navigate('/admin/plazas/nueva')}
            className="bg-parking-primary hover:bg-parking-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plaza
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buscar</label>
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-parking-primary">
                  {parkingSpots.length}
                </h3>
                <p className="text-sm text-gray-600">Total Plazas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">
                  {parkingSpots.filter(s => s.status === 'available').length}
                </h3>
                <p className="text-sm text-gray-600">Disponibles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-600">
                  {parkingSpots.filter(s => s.status === 'occupied').length}
                </h3>
                <p className="text-sm text-gray-600">Ocupadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-600">
                  {parkingSpots.filter(s => s.status === 'maintenance').length}
                </h3>
                <p className="text-sm text-gray-600">Mantenimiento</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parking Spots List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parking-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando plazas...</p>
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No se encontraron plazas.</p>
            </div>
          ) : (
            filteredSpots.map((spot) => (
              <Card key={spot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{spot.name}</CardTitle>
                    <Badge 
                      variant={
                        spot.status === 'available' ? 'default' :
                        spot.status === 'occupied' ? 'destructive' : 'secondary'
                      }
                    >
                      {spot.status === 'available' ? 'Disponible' :
                       spot.status === 'occupied' ? 'Ocupado' : 'Mantenimiento'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {spot.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${spot.hourlyRate}/hora USD
                  </div>

                  <div className="text-xs text-gray-500">
                    Tipo: {spot.type} • ID: {spot.id}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/plazas/${spot.id}/editar`)}
                      className="flex-1"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSpot(spot.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPlazas;
