import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import MainLayout from '@/components/layout/MainLayout';
import { ParkingSpot } from '@/types';

const RegistradorSpotManagement = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { getSpotsByOwner, addParkingSpot, updateParkingSpot, deleteParkingSpot, loading } = useData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentSpot, setCurrentSpot] = useState<ParkingSpot | null>(null);
  const [userSpots, setUserSpots] = useState<ParkingSpot[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Redirect if not authenticated or not a registrador
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'registrador') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Cargar plazas del usuario
  useEffect(() => {
    const loadUserSpots = async () => {
      if (!currentUser) return;
      
      setDataLoading(true);
      try {
        const spots = await getSpotsByOwner(currentUser.id);
        setUserSpots(spots);
      } catch (error) {
        console.error('Error loading user spots:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadUserSpots();
  }, [currentUser, getSpotsByOwner]);
  
  if (!currentUser || currentUser.role !== 'registrador') {
    return null;
  }
  
  // Filter spots based on search term
  const filteredSpots = userSpots.filter(spot => 
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort spots by name
  const sortedSpots = [...filteredSpots].sort((a, b) => a.name.localeCompare(b.name));
  
  // Handle adding a new spot
  const handleAddSpot = async (data: Omit<ParkingSpot, "id" | "status">) => {
    try {
      await addParkingSpot({
        ...data,
        ownerId: currentUser.id
      });
      setOpenAddDialog(false);
      
      // Recargar plazas
      const updatedSpots = await getSpotsByOwner(currentUser.id);
      setUserSpots(updatedSpots);
    } catch (error) {
      console.error('Error adding spot:', error);
    }
  };
  
  // Handle editing a spot
  const handleEditSpot = async (id: string, data: Partial<ParkingSpot>) => {
    try {
      await updateParkingSpot(id, data);
      setOpenEditDialog(false);
      setCurrentSpot(null);
      
      // Recargar plazas
      const updatedSpots = await getSpotsByOwner(currentUser.id);
      setUserSpots(updatedSpots);
    } catch (error) {
      console.error('Error updating spot:', error);
    }
  };
  
  // Handle deleting a spot
  const handleDeleteSpot = async () => {
    if (currentSpot) {
      try {
        await deleteParkingSpot(currentSpot.id);
        setOpenDeleteDialog(false);
        setCurrentSpot(null);
        
        // Recargar plazas
        const updatedSpots = await getSpotsByOwner(currentUser.id);
        setUserSpots(updatedSpots);
      } catch (error) {
        console.error('Error deleting spot:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge>;
      case 'occupied':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ocupada</Badge>;
      case 'reserved':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Reservada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <MainLayout title="Administrar Plazas" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Plazas de Estacionamiento</h2>
            <p className="text-gray-600">
              Administre sus plazas de estacionamiento disponibles
            </p>
          </div>
          
          <Button 
            className="bg-parking-secondary hover:bg-parking-primary"
            onClick={() => setOpenAddDialog(true)}
            disabled={loading || dataLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Nueva Plaza
          </Button>
        </div>

        {/* Loading State */}
        {(loading || dataLoading) && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parking-primary"></div>
            <span className="ml-2 text-parking-primary">Cargando plazas...</span>
          </div>
        )}

        {/* Content */}
        {!loading && !dataLoading && (
          <>
            {/* Search and filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-grow max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar plazas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="text-sm text-gray-600">
                {sortedSpots.length} plaza{sortedSpots.length !== 1 ? 's' : ''} encontrada{sortedSpots.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Spots grid */}
            {sortedSpots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSpots.map((spot) => (
                  <Card key={spot.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{spot.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{spot.type}</p>
                        </div>
                        {getStatusBadge(spot.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {spot.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ${spot.hourlyRate}/hora
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCurrentSpot(spot);
                            setOpenEditDialog(true);
                          }}
                          className="flex-1"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setCurrentSpot(spot);
                            setOpenDeleteDialog(true);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MapPin className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {searchTerm ? 'No se encontraron plazas' : 'No tienes plazas registradas'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Intenta con términos de búsqueda diferentes' 
                    : 'Comienza agregando tu primera plaza de estacionamiento'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setOpenAddDialog(true)}
                    className="bg-parking-secondary hover:bg-parking-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Plaza
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Spot Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Plaza</DialogTitle>
          </DialogHeader>
          {/* Add form content here */}
        </DialogContent>
      </Dialog>

      {/* Edit Spot Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Plaza</DialogTitle>
          </DialogHeader>
          {/* Edit form content here */}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plaza "{currentSpot?.name}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteSpot}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default RegistradorSpotManagement;
