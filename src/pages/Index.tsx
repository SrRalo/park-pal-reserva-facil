
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  
  React.useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-parking-primary text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            ParkSmart
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Sistema de gestión de estacionamiento inteligente para reservas y administración de plazas
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-white text-parking-primary hover:bg-gray-100"
            >
              Iniciar Sesión
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/register')}
              className="border-white text-white hover:bg-parking-primary/20"
            >
              Registrarse
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-parking-primary">
            Características Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-parking-light hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-parking-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-parking-primary">Gestión de Plazas</h3>
                <p className="text-gray-600">
                  Administre las plazas disponibles, defina características y tarifas, y visualice reportes de ingresos.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-parking-light hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-parking-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-parking-primary">Reservas en Línea</h3>
                <p className="text-gray-600">
                  Consulte la disponibilidad en tiempo real y reserve hasta 3 plazas de manera simultánea.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-parking-light hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-parking-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-parking-primary">Tickets Automáticos</h3>
                <p className="text-gray-600">
                  Genere tickets con toda la información de la reserva y calcule automáticamente el costo según el tiempo de uso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-parking-light">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-parking-primary">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-700">
            Registre su empresa o cree una cuenta personal para comenzar a utilizar nuestro sistema de gestión de estacionamiento.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-parking-primary hover:bg-parking-secondary"
            >
              Crear Cuenta
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="border-parking-primary text-parking-primary hover:bg-parking-primary/10"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-parking-primary text-white py-8 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} ParkSmart - Sistema de Gestión de Estacionamiento</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
