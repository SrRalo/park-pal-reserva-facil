
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-parking-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-parking-primary">ParkSmart</h1>
          <p className="text-gray-600">Sistema de Gestión de Estacionamiento</p>
        </div>
        
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="correo@ejemplo.com" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="******" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-parking-primary hover:bg-parking-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
                
                {/* Demo accounts for testing */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-center mb-2 text-muted-foreground">
                    Para demostración, use:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-center">
                    <div className="p-2 border rounded-md bg-gray-50">
                      <div className="font-bold">Registrador</div>
                      <div>juan@parksmart.com</div>
                      <div>cualquier contraseña</div>
                    </div>
                    <div className="p-2 border rounded-md bg-gray-50">
                      <div className="font-bold">Reservador</div>
                      <div>ana@parksmart.com</div>
                      <div>cualquier contraseña</div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm">
              ¿No tiene una cuenta?{' '}
              <Link 
                to="/register" 
                className="text-parking-secondary hover:underline font-medium"
              >
                Registrarse
              </Link>
            </div>
            <Link 
              to="/" 
              className="text-center text-sm text-gray-500 hover:underline"
            >
              Volver a la página principal
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
