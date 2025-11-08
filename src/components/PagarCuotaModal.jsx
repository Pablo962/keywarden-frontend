import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { pagarCuota } from '@/api/facturaService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const pagoSchema = z.object({
  metodo_pago: z.string().min(1, 'Seleccione un método de pago'),
  fecha_pago: z.date({ 
    required_error: 'Seleccione la fecha de pago',
    invalid_type_error: 'Fecha inválida'
  }),
  observaciones: z.string().optional()
});

export const PagarCuotaModal = ({ isOpen, onClose, cuota, onSuccess }) => {
  const form = useForm({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      metodo_pago: '',
      fecha_pago: new Date(),
      observaciones: ''
    }
  });

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && cuota) {
      form.reset({
        metodo_pago: '',
        fecha_pago: new Date(), // Aseguramos que siempre sea una fecha válida
        observaciones: ''
      });
    }
  }, [isOpen, cuota, form]);

  const onSubmit = async (data) => {
    try {
      const dataPago = {
        metodo_pago: data.metodo_pago,
        fecha_pago: format(data.fecha_pago, 'yyyy-MM-dd'),
        observaciones: data.observaciones || ''
      };

      await pagarCuota(cuota.id_plan_pago, dataPago);
      toast.success('Cuota pagada exitosamente');
      form.reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar el pago');
    }
  };

  if (!cuota) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-compact glass-card border-primary/30">
        <DialogHeader style={{ marginBottom: '20px' }}>
          <DialogTitle className="text-lg font-semibold tracking-tight">💳 Pagar Cuota #{cuota.numero_cuota}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-3 border-b border-border/30" style={{ marginBottom: '20px' }}>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Importe:</span>
            <span className="font-semibold text-foreground">${parseFloat(cuota.importe).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vencimiento:</span>
            <span className="text-foreground">{format(new Date(cuota.fecha_vencimiento), 'dd/MM/yyyy')}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormField
              control={form.control}
              name="metodo_pago"
              render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <FormLabel className="text-sm font-medium text-foreground">Método de Pago *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                        <SelectValue placeholder="Seleccione método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-card border-primary/30">
                      <SelectItem value="Efectivo">💵 Efectivo</SelectItem>
                      <SelectItem value="Transferencia">🏦 Transferencia</SelectItem>
                      <SelectItem value="Cheque">📝 Cheque</SelectItem>
                      <SelectItem value="Tarjeta">💳 Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_pago"
              render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <FormLabel className="text-sm font-medium text-foreground">Fecha de Pago *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'text-sm bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          style={{ height: '44px', width: '100%' }}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Seleccione fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-card border-primary/30" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || new Date()}
                        onSelect={(date) => field.onChange(date || new Date())}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <FormLabel className="text-sm font-medium text-foreground">Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Comprobante N° 12345..."
                      className="resize-none input-cosmic text-sm min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter style={{ marginTop: '8px', gap: '12px' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all"
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-cosmic text-sm h-9">
                Confirmar Pago
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
