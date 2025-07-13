import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, Car, Mail, Building } from 'lucide-react';
import { EstacionamientoAdmin } from '@/types/api';
import { estacionamientoService } from '@/services/estacionamientoService';
import { useToast } from '@/hooks/use-toast';

// Schema de validación basado en el modelo del backend
const estacionamientoSchema = z.object({
  nombre: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre debe tener máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email debe tener máximo 100 caracteres'),
  direccion: z.string()
    .min(1, 'Dirección es requerida')
    .max(255, 'Dirección debe tener máximo 255 caracteres'),
  espacios_totales: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number()
      .min(1, 'Debe tener al menos 1 espacio')
      .int('Debe ser un número entero')
  ),
  espacios_disponibles: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number()
      .min(0, 'No puede ser negativo')
      .int('Debe ser un número entero')
  ),
  precio_por_hora: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number()
      .min(0, 'El precio debe ser positivo')
      .multipleOf(0.01, 'Máximo 2 decimales')
  ),
  precio_mensual: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number()
      .min(0, 'El precio debe ser positivo')
      .multipleOf(0.01, 'Máximo 2 decimales')
  ),
  estado: z.enum(['activo', 'inactivo']),
}).refine((data) => data.espacios_disponibles <= data.espacios_totales, {
  message: 'Los espacios disponibles no pueden ser mayores a los espacios totales',
  path: ['espacios_disponibles'],
});

type EstacionamientoFormValues = z.infer<typeof estacionamientoSchema>;

interface EstacionamientoFormProps {
  initialData?: Partial<EstacionamientoAdmin>;
  onSuccess?: (estacionamiento: EstacionamientoAdmin) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export default function EstacionamientoForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  mode = 'create' 
}: EstacionamientoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EstacionamientoFormValues>({
    resolver: zodResolver(estacionamientoSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      email: initialData?.email || '',
      direccion: initialData?.direccion || '',
      espacios_totales: initialData?.espacios_totales || 1,
      espacios_disponibles: initialData?.espacios_disponibles || 1,
      precio_por_hora: initialData?.precio_por_hora || 0,
      precio_mensual: initialData?.precio_mensual || 0,
      estado: initialData?.estado || 'activo',
    },
  });

  const onSubmit = async (data: EstacionamientoFormValues) => {
    setIsLoading(true);
    try {
      let resultado: EstacionamientoAdmin;
      
      if (mode === 'edit' && initialData?.id) {
        resultado = await estacionamientoService.updateEstacionamiento(initialData.id, data);
        toast({
          title: "Éxito",
          description: "Estacionamiento actualizado correctamente",
        });
      } else {
        resultado = await estacionamientoService.createEstacionamiento(data);
        toast({
          title: "Éxito", 
          description: "Estacionamiento creado correctamente",
        });
      }
      
      onSuccess?.(resultado);
    } catch (error) {
      console.error('Error al guardar estacionamiento:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el estacionamiento",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-6 w-6 text-parking-primary" />
          <span>
            {mode === 'edit' ? 'Editar' : 'Agregar Nueva'} Plaza de Estacionamiento
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>Nombre del Estacionamiento</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Plaza Central" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>Email de Contacto</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="contacto@estacionamiento.com" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Dirección</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Calle Principal #123, Zona Centro" 
                      className="resize-none"
                      rows={2}
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Espacios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="espacios_totales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Car className="h-4 w-4" />
                      <span>Espacios Totales</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="50" 
                        {...field} 
                        disabled={isLoading}
                        onChange={(e) => {
                          field.onChange(e);
                          // Ajustar espacios disponibles si es necesario
                          const espaciosDisponibles = form.getValues('espacios_disponibles');
                          const nuevoTotal = parseInt(e.target.value) || 0;
                          if (espaciosDisponibles > nuevoTotal) {
                            form.setValue('espacios_disponibles', nuevoTotal);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="espacios_disponibles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <Car className="h-4 w-4 text-green-600" />
                      <span>Espacios Disponibles</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="45" 
                        {...field} 
                        disabled={isLoading}
                        max={form.watch('espacios_totales')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precio_por_hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Precio por Hora (USD)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="5.00" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precio_mensual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Precio Mensual (USD)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="150.00" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="activo">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Activo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactivo">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Inactivo</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex space-x-4 pt-6">
              <Button 
                type="submit" 
                className="flex-1 bg-parking-primary hover:bg-parking-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {mode === 'edit' ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    {mode === 'edit' ? 'Actualizar' : 'Crear'} Estacionamiento
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
