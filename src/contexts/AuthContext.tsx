
import React, { createContext, useState, useContext, ReactNode } from "react";
import { User, UserRole } from "../types";
import { users } from "../data/mockData";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call
    try {
      const user = users.find(u => u.email === email);
      
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Usuario o contraseña incorrectos",
          variant: "destructive"
        });
        return false;
      }
      
      // Simulate a successful login
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.name}!`
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: "Ha ocurrido un error. Por favor intente nuevamente.",
        variant: "destructive"
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
    // In a real app, this would be an API call
    try {
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        toast({
          title: "Error de registro",
          description: "El correo electrónico ya está en uso",
          variant: "destructive"
        });
        return false;
      }
      
      // Create a new user (in a real app, this would be saved to a database)
      const newUser: User = {
        id: `u${users.length + 1}`,
        name,
        email,
        role
      };
      
      // For this mock example, we can't actually modify the imported array
      // In a real app, this would add to the database
      
      // Simulate successful registration and login
      setCurrentUser(newUser);
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${name}!`
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error de registro",
        description: "Ha ocurrido un error. Por favor intente nuevamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente"
    });
  };

  // Check for stored user on initial load
  React.useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
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
