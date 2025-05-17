
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  backLink?: string;
  showLogout?: boolean;
}

export default function MainLayout({ 
  children, 
  title, 
  backLink,
  showLogout = true 
}: MainLayoutProps) {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (backLink) {
      navigate(backLink);
    }
  };

  return (
    <div className="min-h-screen bg-parking-light">
      {/* Header */}
      <header className="bg-parking-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {backLink && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="hover:bg-parking-primary/80 text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser && (
              <span className="hidden md:inline text-sm">
                {currentUser.name} ({currentUser.role === 'registrador' ? 'Administrador' : 'Usuario'})
              </span>
            )}
            
            {showLogout && currentUser && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleLogout}
                className="bg-white text-parking-primary hover:bg-gray-100"
              >
                Cerrar Sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-parking-primary text-white p-4 mt-auto">
        <div className="container mx-auto text-center text-sm">
          &copy; {new Date().getFullYear()} ParkSmart - Sistema de Gestión de Estacionamiento
        </div>
      </footer>
    </div>
  );
}
