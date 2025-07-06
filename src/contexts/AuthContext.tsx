
import React, { useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { DataMapper } from '@/utils/mappers';
import { User } from '@/types';
import { RegisterRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { AuthContext, AuthContextType } from './AuthContext.types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          // Verificar que el token sigue siendo válido
          const isValid = await authService.verifyToken();
          
          if (isValid) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
          } else {
            // Token inválido, limpiar datos
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data?.user && response.data?.access_token) {
        // Mapear usuario del backend al formato del frontend
        const mappedUser = DataMapper.usuarioReservaToUser(response.data.user);
        
        // Guardar datos en localStorage
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        
        // Actualizar estado
        setCurrentUser(mappedUser);
        
        toast({
          title: "Bienvenido",
          description: `Has iniciado sesión exitosamente como ${mappedUser.name}`,
        });
        
        return true;
      }
      
      toast({
        title: "Error de autenticación",
        description: response.message || "Credenciales inválidas",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      
      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      const response = await authService.register(data);
      
      if (response.success && response.data) {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
        });
        
        return true;
      }
      
      toast({
        title: "Error de registro",
        description: response.message || "Error al crear la cuenta",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      
      toast({
        title: "Error de registro",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      
      // Limpiar estado
      setCurrentUser(null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Limpiar estado local aunque falle la llamada al backend
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

