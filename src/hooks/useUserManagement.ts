import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import UserService, { UserData, CreateUserData, UpdateUserData, UserStats } from '@/services/userService';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'registrador' | 'reservador';
  documento?: string;
  telefono?: string;
  estado?: 'activo' | 'inactivo';
  apellido?: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    admin: 0,
    registrador: 0,
    reservador: 0,
    activos: 0,
    inactivos: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  // Cargar usuarios desde el backend
  const loadUsers = async () => {
    setDataLoading(true);
    try {
      const userData = await UserService.getAllUsers();
      const mappedUsers = userData.map(user => UserService.mapUserDataToUser(user));
      const stats = UserService.calculateUserStats(userData);
      
      setUsers(mappedUsers);
      setUserStats(stats);
      
      return { success: true, data: mappedUsers };
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios del servidor.",
        variant: "destructive",
      });
      
      // Cargar datos mock como fallback
      loadMockData();
      return { success: false, error };
    } finally {
      setDataLoading(false);
    }
  };

  // Cargar datos mock como fallback
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
      }
    ];
    
    setUsers(mockUsers);
    
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

  // Crear usuario
  const createUser = async (userData: CreateUserData) => {
    setIsLoading(true);
    try {
      // Validar datos
      const validationErrors = UserService.validateUserData(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Crear usuario en backend
      const newUserData = await UserService.createUser(userData);
      const newUser = UserService.mapUserDataToUser(newUserData);
      
      // Actualizar estado local
      setUsers(prev => [...prev, newUser]);
      
      // Recalcular estadísticas
      await refreshStats();
      
      toast({
        title: "Usuario creado",
        description: `El usuario ${newUser.name} ha sido creado exitosamente.`,
      });
      
      return { success: true, data: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el usuario";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar usuario
  const updateUser = async (userId: string, userData: UpdateUserData) => {
    setIsLoading(true);
    try {
      // Validar datos
      const validationErrors = UserService.validateUserData(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Actualizar usuario en backend
      const updatedUserData = await UserService.updateUser(userId, userData);
      const updatedUser = UserService.mapUserDataToUser(updatedUserData);
      
      // Actualizar estado local
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      // Recalcular estadísticas
      await refreshStats();
      
      toast({
        title: "Usuario actualizado",
        description: `El usuario ${updatedUser.name} ha sido actualizado exitosamente.`,
      });
      
      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo actualizar el usuario";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // Eliminar usuario en backend
      await UserService.deleteUser(userId);
      
      // Obtener el usuario a eliminar para el mensaje
      const userToDelete = users.find(u => u.id === userId);
      
      // Actualizar estado local
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Recalcular estadísticas
      await refreshStats();
      
      toast({
        title: "Usuario eliminado",
        description: `El usuario ${userToDelete?.name} ha sido eliminado exitosamente.`,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo eliminar el usuario";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar estadísticas
  const refreshStats = async () => {
    try {
      const userData = await UserService.getAllUsers();
      const stats = UserService.calculateUserStats(userData);
      setUserStats(stats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // Filtrar usuarios
  const filterUsers = (
    searchTerm: string,
    roleFilter: string,
    statusFilter: string
  ) => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.estado === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  // Cargar usuarios inicialmente
  useEffect(() => {
    const initializeUsers = async () => {
      setDataLoading(true);
      try {
        const userData = await UserService.getAllUsers();
        const mappedUsers = userData.map(user => UserService.mapUserDataToUser(user));
        const stats = UserService.calculateUserStats(userData);
        
        setUsers(mappedUsers);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios del servidor.",
          variant: "destructive",
        });
        
        // Cargar datos mock como fallback
        loadMockData();
      } finally {
        setDataLoading(false);
      }
    };
    
    initializeUsers();
  }, [toast]); // Incluir toast como dependencia

  return {
    users,
    userStats,
    isLoading,
    dataLoading,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    filterUsers,
    refreshStats
  };
}

export default useUserManagement;
