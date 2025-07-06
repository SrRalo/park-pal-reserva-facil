import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, User, Shield, Users, Loader2 } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import MainLayout from '@/components/layout/MainLayout';
import { User as UserType } from '@/types';
import UserService, { UserData, CreateUserData, UpdateUserData, UserStats } from '@/services/userService';

interface UserFormData {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  telefono: string;
  password: string;
  role: 'admin' | 'registrador' | 'reservador';
  estado: 'activo' | 'inactivo';
}

interface ExtendedUser extends UserType {
  documento?: string;
  telefono?: string;
  estado?: 'activo' | 'inactivo';
  apellido?: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    admin: 0,
    registrador: 0,
    reservador: 0,
    activos: 0,
    inactivos: 0
  });
  
  // Form data for add/edit
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    telefono: '',
    password: '',
    role: 'reservador',
    estado: 'activo'
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      toast({
        title: "Acceso Denegado",
        description: "No tienes permisos para acceder a esta página.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, currentUser, navigate, toast]);

  // Load users from backend
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAuthenticated || currentUser?.role !== 'admin') return;
      
      setDataLoading(true);
      try {
        const userData = await UserService.getAllUsers();
        const mappedUsers = userData.map(user => UserService.mapUserDataToUser(user));
        const stats = UserService.calculateUserStats(userData);
        
        setUsers(mappedUsers);
        setUserStats(stats);
        
        toast({
          title: "Usuarios cargados",
          description: `Se cargaron ${userData.length} usuarios exitosamente.`,
        });
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios. Intentando con datos locales...",
          variant: "destructive",
        });
        
        // Fallback a datos mock si falla la carga del backend
        loadMockData();
      } finally {
        setDataLoading(false);
      }
    };

    loadUsers();
  }, [isAuthenticated, currentUser, toast]);

  // Fallback mock data for development/testing
  const loadMockData = () => {
    const mockUsers: ExtendedUser[] = [
      {
        id: '1',
        name: 'Admin Sistema',
        email: 'admin@parksmart.com',
        role: 'admin',
        documento: '12345678',
        telefono: '123456789',
        estado: 'activo',
        apellido: 'Sistema'
      },
      {
        id: '2',
        name: 'Juan Pérez',
        email: 'registrador@ejemplo.com',
        role: 'registrador',
        documento: '87654321',
        telefono: '987654321',
        estado: 'activo',
        apellido: 'Pérez'
      },
      {
        id: '3',
        name: 'María García',
        email: 'maria@cliente.com',
        role: 'reservador',
        documento: '11223344',
        telefono: '555666777',
        estado: 'activo',
        apellido: 'García'
      },
      {
        id: '4',
        name: 'Carlos López',
        email: 'carlos@owner.com',
        role: 'registrador',
        documento: '99887766',
        telefono: '444333222',
        estado: 'activo',
        apellido: 'López'
      },
      {
        id: '5',
        name: 'Ana Martínez',
        email: 'ana@usuario.com',
        role: 'reservador',
        documento: '55443322',
        telefono: '111222333',
        estado: 'inactivo',
        apellido: 'Martínez'
      },
    ];
    
    setUsers(mockUsers);
    
    // Calcular stats mock
    const mockStats: UserStats = {
      total: mockUsers.length,
      admin: mockUsers.filter(u => u.role === 'admin').length,
      registrador: mockUsers.filter(u => u.role === 'registrador').length,
      reservador: mockUsers.filter(u => u.role === 'reservador').length,
      activos: mockUsers.filter(u => u.estado === 'activo').length,
      inactivos: mockUsers.filter(u => u.estado === 'inactivo').length
    };
    
    setUserStats(mockStats);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.estado === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      documento: '',
      telefono: '',
      password: '',
      role: 'reservador',
      estado: 'activo'
    });
  };

  // Handle add user
  const handleAddUser = async () => {
    setIsLoading(true);
    try {
      // Validar datos
      const validationErrors = UserService.validateUserData(formData);
      if (validationErrors.length > 0) {
        toast({
          title: "Error de validación",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      // Crear usuario en backend
      const newUserData = await UserService.createUser(formData);
      const newUser = UserService.mapUserDataToUser(newUserData);
      
      // Actualizar estado local
      setUsers(prev => [...prev, newUser]);
      
      // Recalcular estadísticas
      const allUserData = await UserService.getAllUsers();
      const stats = UserService.calculateUserStats(allUserData);
      setUserStats(stats);
      
      toast({
        title: "Usuario creado",
        description: `El usuario ${newUser.name} ha sido creado exitosamente.`,
      });
      
      resetForm();
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      // Preparar datos para actualización (sin password)
      const updateData: UpdateUserData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        documento: formData.documento,
        telefono: formData.telefono,
        estado: formData.estado,
      };

      // Validar datos
      const validationErrors = UserService.validateUserData(updateData);
      if (validationErrors.length > 0) {
        toast({
          title: "Error de validación",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      // Actualizar usuario en backend
      const updatedUserData = await UserService.updateUser(selectedUser.id, updateData);
      const updatedUser = UserService.mapUserDataToUser(updatedUserData);
      
      // Actualizar estado local
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      // Recalcular estadísticas
      const allUserData = await UserService.getAllUsers();
      const stats = UserService.calculateUserStats(allUserData);
      setUserStats(stats);
      
      toast({
        title: "Usuario actualizado",
        description: `El usuario ${updatedUser.name} ha sido actualizado exitosamente.`,
      });
      
      setOpenEditDialog(false);
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      // Eliminar usuario en backend
      await UserService.deleteUser(selectedUser.id);
      
      // Actualizar estado local
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      
      // Recalcular estadísticas
      const allUserData = await UserService.getAllUsers();
      const stats = UserService.calculateUserStats(allUserData);
      setUserStats(stats);
      
      toast({
        title: "Usuario eliminado",
        description: `El usuario ${selectedUser.name} ha sido eliminado exitosamente.`,
      });
      
      setOpenDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit dialog with user data
  const openEditUserDialog = (user: ExtendedUser) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.name.split(' ')[0] || '',
      apellido: user.apellido || user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      documento: user.documento || '',
      telefono: user.telefono || '',
      password: '', // No mostramos la contraseña existente
      role: user.role,
      estado: user.estado || 'activo'
    });
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const openDeleteUserDialog = (user: ExtendedUser) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'registrador': return 'default';
      case 'reservador': return 'secondary';
      default: return 'outline';
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'registrador': return 'Registrador';
      case 'reservador': return 'Reservador';
      default: return role;
    }
  };

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <MainLayout title="Gestión de Usuarios" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-sm text-muted-foreground">
                {userStats.activos} activos, {userStats.inactivos} inactivos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {userStats.admin}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Registradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {userStats.registrador}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Reservadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {userStats.reservador}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="registrador">Registrador</SelectItem>
                <SelectItem value="reservador">Reservador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => {
              resetForm();
              setOpenAddDialog(true);
            }}
            className="bg-parking-primary hover:bg-parking-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-parking-primary rounded-full flex items-center justify-center text-white text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.estado === 'activo' ? 'default' : 'secondary'}
                          className={user.estado === 'activo' ? 'text-green-600 border-green-600' : 'text-gray-600 border-gray-600'}
                        >
                          {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditUserDialog(user)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteUserDialog(user)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dataLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Cargando usuarios...
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!dataLoading && filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    placeholder="Pérez"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="documento">Documento</Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({...formData, documento: e.target.value})}
                  placeholder="12345678"
                />
              </div>
              
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as 'admin' | 'registrador' | 'reservador'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="registrador">Registrador</SelectItem>
                      <SelectItem value="reservador">Reservador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData({...formData, estado: value as 'activo' | 'inactivo'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={isLoading || !formData.nombre || !formData.email || !formData.password}
                  className="bg-parking-primary hover:bg-parking-secondary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Usuario'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-apellido">Apellido</Label>
                  <Input
                    id="edit-apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    placeholder="Pérez"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-documento">Documento</Label>
                <Input
                  id="edit-documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({...formData, documento: e.target.value})}
                  placeholder="12345678"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as 'admin' | 'registrador' | 'reservador'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="registrador">Registrador</SelectItem>
                      <SelectItem value="reservador">Reservador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData({...formData, estado: value as 'activo' | 'inactivo'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenEditDialog(false);
                    setSelectedUser(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditUser}
                  disabled={isLoading || !formData.nombre || !formData.email}
                  className="bg-parking-primary hover:bg-parking-secondary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar Usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
                <strong>{selectedUser?.name}</strong> y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUser(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default AdminUsers;
