
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import SpotCard from '@/components/shared/SpotCard';
import SpotForm from '@/components/forms/SpotForm';
import { ParkingSpot } from '@/types';

const RegistradorSpotManagement = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { getSpotsByOwner, addParkingSpot, updateParkingSpot, deleteParkingSpot } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentSpot, setCurrentSpot] = useState<ParkingSpot | null>(null);
  
  // Redirect if not authenticated or not a registrador
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'registrador') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  if (!currentUser || currentUser.role !== 'registrador') {
    return null;
  }
  
  // Get spots owned by the current user
  const userSpots = getSpotsByOwner(currentUser.id);
  
  // Filter spots based on search term
  const filteredSpots = userSpots.filter(spot => 
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort spots by name
  const sortedSpots = [...filteredSpots].sort((a, b) => a.name.localeCompare(b.name));
  
  // Handle adding a new spot
  const handleAddSpot = (data: Omit<ParkingSpot, "id" | "status">) => {
    addParkingSpot({
      ...data,
      ownerId: currentUser.id
    });
    setOpenAddDialog(false);
  };
  
  // Handle editing a spot
  const handleEditSpot = (id: string, data: Partial<ParkingSpot>) => {
    updateParkingSpot(id, data);
    setOpenEditDialog(false);
    setCurrentSpot(null);
  };
  
  // Handle deleting a spot
  const handleDeleteSpot = () => {
    if (currentSpot) {
      deleteParkingSpot(currentSpot.id);
      setOpenDeleteDialog(false);
      setCurrentSpot(null);
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
          >
            Agregar Nueva Plaza
          </Button>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Input
              type="text"
              placeholder="Buscar plazas por nombre, ubicación o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">
              {sortedSpots.length} plazas encontradas
            </span>
          </div>
        </div>
        
        {/* Spots grid */}
        {sortedSpots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isRegistrador={true}
                onEdit={() => {
                  setCurrentSpot(spot);
                  setOpenEditDialog(true);
                }}
                onDelete={() => {
                  setCurrentSpot(spot);
                  setOpenDeleteDialog(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl font-medium text-gray-600 mb-4">
              No hay plazas disponibles
            </p>
            <p className="text-gray-500 mb-6">
              Agregue nuevas plazas para comenzar a gestionar su estacionamiento
            </p>
            <Button 
              className="bg-parking-secondary hover:bg-parking-primary"
              onClick={() => setOpenAddDialog(true)}
            >
              Agregar Nueva Plaza
            </Button>
          </div>
        )}
      </div>
      
      {/* Add Spot Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Plaza</DialogTitle>
          </DialogHeader>
          <SpotForm 
            onSubmit={handleAddSpot}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Spot Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Plaza</DialogTitle>
          </DialogHeader>
          {currentSpot && (
            <SpotForm 
              initialData={currentSpot}
              onSubmit={(data) => handleEditSpot(currentSpot.id, data)}
              onCancel={() => setOpenEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar esta plaza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plaza será eliminada permanentemente del sistema.
              <br />
              {currentSpot?.status !== 'available' && (
                <span className="text-red-500 font-medium block mt-2">
                  Nota: No se puede eliminar una plaza con reservaciones activas.
                </span>
              )}
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
