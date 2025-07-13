import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Car, Hash, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import MainLayout from '@/components/layout/MainLayout';
import VehiculoForm from '@/components/forms/VehiculoForm';
import { Vehiculo } from '@/types/api';
import { vehiculoService } from '@/services/vehiculoService';

const ReservadorVehicles = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentVehiculo, setCurrentVehiculo] = useState<Vehiculo | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Redirect if not authenticated or not a reservador
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'reservador') {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Cargar vehículos del usuario
  useEffect(() => {
    const loadVehiculos = async () => {
      if (!currentUser) return;
      
      setDataLoading(true);
      try {
        const data = await vehiculoService.getVehiculosByUser(parseInt(currentUser.id));
        setVehiculos(data);
      } catch (error) {
        console.error('Error loading vehiculos:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al cargar los vehículos",
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadVehiculos();
  }, [currentUser, toast]);
  
  if (!currentUser || currentUser.role !== 'reservador') {
    return null;
  }
  
  // Filter vehiculos based on search term
  const filteredVehiculos = vehiculos.filter(vehiculo => 
    vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.color.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort vehiculos by placa
  const sortedVehiculos = [...filteredVehiculos].sort((a, b) => a.placa.localeCompare(b.placa));
  
  // Handle success after add/edit
  const handleSuccess = async (vehiculo: Vehiculo) => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setCurrentVehiculo(null);
    
    // Recargar vehículos
    try {
      const data = await vehiculoService.getVehiculosByUser(parseInt(currentUser.id));
      setVehiculos(data);
    } catch (error) {
      console.error('Error reloading vehiculos:', error);
    }
  };
  
  // Handle deleting a vehiculo
  const handleDeleteVehiculo = async () => {
    if (currentVehiculo) {
      try {
        await vehiculoService.deleteVehiculo(currentVehiculo.placa);
        setOpenDeleteDialog(false);
        setCurrentVehiculo(null);
        
        // Recargar vehículos
        const data = await vehiculoService.getVehiculosByUser(parseInt(currentUser.id));
        setVehiculos(data);
        
        toast({
          title: "Éxito",
          description: "Vehículo eliminado correctamente",
        });
      } catch (error) {
        console.error('Error deleting vehiculo:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al eliminar el vehículo",
        });
      }
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>;
      case 'inactivo':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <MainLayout title="Mis Vehículos" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Mis Vehículos</h2>
            <p className="text-gray-600">
              Gestiona los vehículos que puedes usar para reservar plazas
            </p>
          </div>
          
          <Button 
            className="bg-parking-secondary hover:bg-parking-primary"
            onClick={() => setOpenAddDialog(true)}
            disabled={dataLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Vehículo
          </Button>
        </div>

        {/* Loading State */}
        {dataLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parking-primary"></div>
            <span className="ml-2 text-parking-primary">Cargando vehículos...</span>
          </div>
        )}

        {/* Content */}
        {!dataLoading && (
          <>
            {/* Search and filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-grow max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar por placa, modelo o color..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="text-sm text-gray-600">
                {sortedVehiculos.length} vehículo{sortedVehiculos.length !== 1 ? 's' : ''} encontrado{sortedVehiculos.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Vehiculos grid */}
            {sortedVehiculos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedVehiculos.map((vehiculo) => (
                  <Card key={vehiculo.placa} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Car className="h-5 w-5 text-parking-primary" />
                            <span>{vehiculo.placa}</span>
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                            <Hash className="h-4 w-4" />
                            <span>{vehiculo.modelo}</span>
                          </p>
                        </div>
                        {getStatusBadge(vehiculo.estado)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Palette className="w-4 h-4 mr-2" />
                        <span>{vehiculo.color}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <span>Registrado: {new Date(vehiculo.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCurrentVehiculo(vehiculo);
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
                            setCurrentVehiculo(vehiculo);
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
                  <Car className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {searchTerm ? 'No se encontraron vehículos' : 'No tienes vehículos registrados'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Intenta con términos de búsqueda diferentes' 
                    : 'Registra tu primer vehículo para poder hacer reservas'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setOpenAddDialog(true)}
                    className="bg-parking-secondary hover:bg-parking-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primer Vehículo
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Vehiculo Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Vehículo</DialogTitle>
          </DialogHeader>
          <VehiculoForm
            mode="create"
            userId={parseInt(currentUser.id)}
            onSuccess={handleSuccess}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Vehiculo Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
          </DialogHeader>
          <VehiculoForm
            mode="edit"
            userId={parseInt(currentUser.id)}
            initialData={currentVehiculo || undefined}
            onSuccess={handleSuccess}
            onCancel={() => {
              setOpenEditDialog(false);
              setCurrentVehiculo(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El vehículo "{currentVehiculo?.placa}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteVehiculo}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default ReservadorVehicles;
