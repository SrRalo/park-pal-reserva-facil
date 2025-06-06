
import { createContext, useContext, useState, ReactNode } from 'react';
import { authService } from '@/lib/api/auth';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      
      // Guardar el token y la información del usuario
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setCurrentUser(response.user);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.name}!`,
      });
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al iniciar sesión";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        role,
      });
      
      // Guardar el token y la información del usuario
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setCurrentUser(response.user);
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${name}!`,
      });
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al registrarse";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setCurrentUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
    }
  };
  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
