
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-parking-light p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-parking-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          La página que está buscando no existe o ha sido movida.
        </p>
        <div className="space-y-4">
          <Button 
            className="w-full bg-parking-primary hover:bg-parking-secondary"
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
          <Button 
            variant="outline"
            className="w-full border-parking-primary text-parking-primary hover:bg-parking-primary/5"
            onClick={() => navigate(-1)}
          >
            Volver a la Página Anterior
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
