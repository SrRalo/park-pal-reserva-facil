
import React from 'react';
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
import { ParkingSpot } from '@/types';

const spotSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  location: z.string().min(1, 'Ubicación es requerida'),
  hourlyRate: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'La tarifa debe ser un valor positivo')
  ),
  type: z.string().min(1, 'Tipo es requerido'),
});

type SpotFormValues = z.infer<typeof spotSchema>;

interface SpotFormProps {
  initialData?: Partial<ParkingSpot>;
  onSubmit: (data: SpotFormValues) => void;
  onCancel?: () => void;
}

export default function SpotForm({ initialData, onSubmit, onCancel }: SpotFormProps) {
  const form = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: initialData?.name || '',
      location: initialData?.location || '',
      hourlyRate: initialData?.hourlyRate || 0,
      type: initialData?.type || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Plaza</FormLabel>
              <FormControl>
                <Input placeholder="A-01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Nivel 1, Zona A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarifa por Hora (COP)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Económico">Económico</SelectItem>
                  <SelectItem value="Discapacitados">Discapacitados</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4 pt-4">
          <Button type="submit" className="flex-1 bg-parking-secondary hover:bg-parking-primary">
            {initialData ? 'Actualizar' : 'Crear'} Plaza
          </Button>
          
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
