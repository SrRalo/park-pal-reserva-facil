
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
import { ParkingSpot } from '@/types';

const reservationSchema = z.object({
  licensePlate: z.string().min(1, 'Placa del vehículo es requerida'),
  estimatedEntryTime: z.string().min(1, 'Hora de entrada estimada es requerida'),
  estimatedExitTime: z.string().min(1, 'Hora de salida estimada es requerida'),
  fiscalId: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  spot: ParkingSpot;
  onSubmit: (data: ReservationFormValues) => void;
  onCancel: () => void;
}

export default function ReservationForm({ spot, onSubmit, onCancel }: ReservationFormProps) {
  // Set default entry time to now and exit time to 2 hours from now
  const now = new Date();
  const twoHoursLater = new Date(now);
  twoHoursLater.setHours(now.getHours() + 2);
  
  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  };

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      licensePlate: '',
      estimatedEntryTime: formatDateForInput(now),
      estimatedExitTime: formatDateForInput(twoHoursLater),
      fiscalId: '',
    },
  });

  const transformFormData = (data: ReservationFormValues) => {
    const processedData = {
      ...data,
      estimatedEntryTime: new Date(data.estimatedEntryTime),
      estimatedExitTime: new Date(data.estimatedExitTime),
    };
    onSubmit(processedData);
  };

  // Calculate estimated cost based on form values
  const calculateEstimatedCost = () => {
    const values = form.getValues();
    if (!values.estimatedEntryTime || !values.estimatedExitTime) return 0;
    
    const entryTime = new Date(values.estimatedEntryTime);
    const exitTime = new Date(values.estimatedExitTime);
    
    // Calculate hours difference
    const diffMs = exitTime.getTime() - entryTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.max(0, Math.ceil(diffHours * spot.hourlyRate));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(transformFormData)} className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Detalles de la Plaza</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Nombre:</div>
            <div className="font-medium">{spot.name}</div>
            <div className="text-muted-foreground">Ubicación:</div>
            <div className="font-medium">{spot.location}</div>
            <div className="text-muted-foreground">Tipo:</div>
            <div className="font-medium">{spot.type}</div>
            <div className="text-muted-foreground">Tarifa:</div>
            <div className="font-medium">${spot.hourlyRate.toLocaleString()}/hora</div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="ABC123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fiscalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificación Fiscal (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="NIF/RUT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimatedEntryTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Entrada Estimada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} onChange={(e) => {
                    field.onChange(e);
                    form.trigger("estimatedExitTime"); // Re-validate exit time when entry time changes
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedExitTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Salida Estimada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between">
            <span className="font-medium">Costo Estimado:</span>
            <span className="font-bold text-parking-primary">${calculateEstimatedCost().toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            El costo final se calculará al momento de salida basado en el tiempo real de uso.
          </p>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button type="submit" className="flex-1 bg-parking-secondary hover:bg-parking-primary">
            Confirmar Reserva
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
