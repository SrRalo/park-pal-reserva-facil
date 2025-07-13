import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, MapPin, DollarSign, Car, Building, Mail } from 'lucide-react';
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
import EstacionamientoForm from '@/components/forms/EstacionamientoForm';
import { EstacionamientoAdmin } from '@/types/api';
import { estacionamientoService } from '@/services/estacionamientoService';

const RegistradorSpotManagementNew = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentEstacionamiento, setCurrentEstacionamiento] = useState<EstacionamientoAdmin | null>(null);
  const [estacionamientos, setEstacionamientos] = useState<EstacionamientoAdmin[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Redirect if not authenticated or not a registrador
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'registrador') {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Cargar estacionamientos
  useEffect(() => {
    const loadEstacionamientos = async () => {
      if (!currentUser) return;
      
      setDataLoading(true);
      try {
        const data = await estacionamientoService.getAllEstacionamientos();
        setEstacionamientos(data);
      } catch (error) {
        console.error('Error loading estacionamientos:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al cargar los estacionamientos",
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadEstacionamientos();
  }, [currentUser, toast]);
  
  if (!currentUser || currentUser.role !== 'registrador') {
    return null;
  }
  
  // Filter estacionamientos based on search term
  const filteredEstacionamientos = estacionamientos.filter(estacionamiento => 
    estacionamiento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estacionamiento.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estacionamiento.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort estacionamientos by name
  const sortedEstacionamientos = [...filteredEstacionamientos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  
  // Handle success after add/edit
  const handleSuccess = async (estacionamiento: EstacionamientoAdmin) => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setCurrentEstacionamiento(null);
    
    // Recargar estacionamientos
    try {
      const data = await estacionamientoService.getAllEstacionamientos();
      setEstacionamientos(data);
      toast({
        title: "Éxito",
        description: "Operación completada exitosamente",
      });
    } catch (error) {
      console.error('Error reloading estacionamientos:', error);
    }
  };
  
  // Handle deleting an estacionamiento
  const handleDeleteEstacionamiento = async () => {
    if (currentEstacionamiento) {
      try {
        await estacionamientoService.deleteEstacionamiento(currentEstacionamiento.id!);
        setOpenDeleteDialog(false);
        setCurrentEstacionamiento(null);
        
        // Recargar estacionamientos
        const data = await estacionamientoService.getAllEstacionamientos();
        setEstacionamientos(data);
        
        toast({
          title: "Éxito",
          description: "Estacionamiento eliminado correctamente",
        });
      } catch (error) {
        console.error('Error deleting estacionamiento:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al eliminar el estacionamiento",
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
            disabled={dataLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Nueva Plaza
          </Button>
        </div>

        {/* Loading State */}
        {dataLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parking-primary"></div>
            <span className="ml-2 text-parking-primary">Cargando plazas...</span>
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
                  placeholder="Buscar estacionamientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="text-sm text-gray-600">
                {sortedEstacionamientos.length} estacionamiento{sortedEstacionamientos.length !== 1 ? 's' : ''} encontrado{sortedEstacionamientos.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Estacionamientos grid */}
            {sortedEstacionamientos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEstacionamientos.map((estacionamiento) => (
                  <Card key={estacionamiento.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Building className="h-5 w-5 text-parking-primary" />
                            <span>{estacionamiento.nombre}</span>
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{estacionamiento.email}</span>
                          </p>
                        </div>
                        {getStatusBadge(estacionamiento.estado)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-2">{estacionamiento.direccion}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Car className="w-4 h-4 mr-1" />
                          <span>{estacionamiento.espacios_disponibles}/{estacionamiento.espacios_totales}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>${estacionamiento.precio_por_hora}/h</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Mensual:</span> ${estacionamiento.precio_mensual}
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCurrentEstacionamiento(estacionamiento);
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
                            setCurrentEstacionamiento(estacionamiento);
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
                  <Building className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {searchTerm ? 'No se encontraron estacionamientos' : 'No tienes estacionamientos registrados'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Intenta con términos de búsqueda diferentes' 
                    : 'Comienza agregando tu primer estacionamiento'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setOpenAddDialog(true)}
                    className="bg-parking-secondary hover:bg-parking-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Estacionamiento
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Estacionamiento Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Plaza de Estacionamiento</DialogTitle>
          </DialogHeader>
          <EstacionamientoForm
            mode="create"
            onSuccess={handleSuccess}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Estacionamiento Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plaza de Estacionamiento</DialogTitle>
          </DialogHeader>
          <EstacionamientoForm
            mode="edit"
            initialData={currentEstacionamiento || undefined}
            onSuccess={handleSuccess}
            onCancel={() => {
              setOpenEditDialog(false);
              setCurrentEstacionamiento(null);
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
              Esta acción no se puede deshacer. El estacionamiento "{currentEstacionamiento?.nombre}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteEstacionamiento}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default RegistradorSpotManagementNew;
