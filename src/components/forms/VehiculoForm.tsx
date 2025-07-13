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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Palette, Hash, User } from 'lucide-react';
import { Vehiculo } from '@/types/api';
import { vehiculoService } from '@/services/vehiculoService';
import { useToast } from '@/hooks/use-toast';

// Schema de validación basado en el modelo del backend
const vehiculoSchema = z.object({
  placa: z.string()
    .min(1, 'Placa es requerida')
    .max(20, 'Placa debe tener máximo 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Placa debe contener solo letras mayúsculas, números y guiones'),
  modelo: z.string()
    .min(1, 'Modelo es requerido')
    .max(100, 'Modelo debe tener máximo 100 caracteres'),
  color: z.string()
    .min(1, 'Color es requerido')
    .max(50, 'Color debe tener máximo 50 caracteres'),
  estado: z.enum(['activo', 'inactivo']),
  usuario_id: z.number(),
});

type VehiculoFormValues = z.infer<typeof vehiculoSchema>;

interface VehiculoFormProps {
  initialData?: Partial<Vehiculo>;
  onSuccess?: (vehiculo: Vehiculo) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  userId: number;
}

const coloresComunes = [
  'Blanco',
  'Negro',
  'Gris',
  'Plateado',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Naranja',
  'Morado',
  'Café',
  'Beige',
];

export default function VehiculoForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  mode = 'create',
  userId
}: VehiculoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VehiculoFormValues>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: initialData?.placa || '',
      modelo: initialData?.modelo || '',
      color: initialData?.color || '',
      estado: initialData?.estado || 'activo',
      usuario_id: userId,
    },
  });

  const onSubmit = async (data: VehiculoFormValues) => {
    setIsLoading(true);
    try {
      let resultado: Vehiculo;
      
      if (mode === 'edit' && initialData?.placa) {
        resultado = await vehiculoService.updateVehiculo(initialData.placa, data);
        toast({
          title: "Éxito",
          description: "Vehículo actualizado correctamente",
        });
      } else {
        // Asegurar que todos los campos requeridos estén presentes
        const vehiculoData: Omit<Vehiculo, 'created_at' | 'updated_at'> = {
          placa: data.placa,
          modelo: data.modelo,
          color: data.color,
          estado: data.estado,
          usuario_id: data.usuario_id,
        };
        resultado = await vehiculoService.createVehiculo(vehiculoData);
        toast({
          title: "Éxito", 
          description: "Vehículo registrado correctamente",
        });
      }
      
      onSuccess?.(resultado);
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el vehículo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-parking-primary" />
          <span>
            {mode === 'edit' ? 'Editar' : 'Registrar'} Vehículo
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Placa */}
            <FormField
              control={form.control}
              name="placa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <Hash className="h-4 w-4" />
                    <span>Placa del Vehículo</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ABC123" 
                      {...field}
                      disabled={isLoading || mode === 'edit'}
                      style={{ textTransform: 'uppercase' }}
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {mode === 'edit' ? 'La placa no se puede modificar' : 'Formato: ABC123, ABC-123, etc.'}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Modelo */}
            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <Car className="h-4 w-4" />
                    <span>Modelo del Vehículo</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Toyota Corolla 2020" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-1">
                    <Palette className="h-4 w-4" />
                    <span>Color</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coloresComunes.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            <div className="flex space-x-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-parking-primary hover:bg-parking-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {mode === 'edit' ? 'Actualizando...' : 'Registrando...'}
                  </>
                ) : (
                  <>
                    {mode === 'edit' ? 'Actualizar' : 'Registrar'} Vehículo
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
