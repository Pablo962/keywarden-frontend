import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getFacturas, createFactura, getFacturaById } from '@/api/facturaService';
import { getOrdenesCompra, getOrdenCompraById } from '@/api/ordenCompraService'; // Para el dropdown y cargar items
import { PagarCuotaModal } from '@/components/PagarCuotaModal';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

// Importa componentes shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// --- 1. Definir los Schemas (Reglas) ---
const infoPagoSchema = z.object({
  cantidad_cuotas: z.coerce.number().min(1, "Debe ser al menos 1 cuota.").max(12),
  primer_vencimiento: z.date({ required_error: "Seleccione una fecha." }),
});

const facturaSchema = z.object({
  orden_compra_id_orden_compra: z.string().min(1, "Seleccione una Orden de Compra."),
  info_pago: infoPagoSchema,
});

export const FacturasPage = () => {
  // --- 2. Estados ---
  const [facturas, setFacturas] = useState([]);
  const [ordenesCompra, setOrdenesCompra] = useState([]); // Para el <Select>
  const [selectedOrdenItems, setSelectedOrdenItems] = useState([]); // Items de la OC seleccionada
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isPagarModalOpen, setIsPagarModalOpen] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);

  // --- 3. Configuración del Formulario ---
  const form = useForm({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      orden_compra_id_orden_compra: "",
      info_pago: { cantidad_cuotas: 1, primer_vencimiento: undefined }
    }
  });

  // --- 4. Cargar datos (Facturas y Órdenes de Compra) ---
  const loadData = async () => {
    try {
      setLoading(true);
      const [facturasData, ordenesData] = await Promise.all([
        getFacturas(),
        getOrdenesCompra() // Para el dropdown
      ]);
      setFacturas(facturasData);
      setOrdenesCompra(ordenesData);
    } catch (error) {
      toast.error('Error al cargar datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 5. Handlers ---
  
  // Cuando el usuario selecciona una OC del dropdown
  const handleOrdenSelect = async (ordenId) => {
    if (!ordenId) {
      setSelectedOrdenItems([]);
      return;
    }
    form.setValue("orden_compra_id_orden_compra", ordenId);
    try {
      // Hacemos un llamado a la API para traer los items de esa orden
      const ordenCompleta = await getOrdenCompraById(ordenId);
      setSelectedOrdenItems(ordenCompleta.items || []);
    } catch (error) {
      toast.error('Error al cargar los items de la Orden de Compra.');
    }
  };
  
  const onSubmit = async (data) => {
    try {
      // Preparamos los datos para la API
      const dataToSubmit = {
        ...data,
        orden_compra_id_orden_compra: parseInt(data.orden_compra_id_orden_compra),
        // Los items los tomamos del estado, no del formulario
        items: selectedOrdenItems.map(item => ({
          producto_id_producto: item.producto_id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      };

      if (dataToSubmit.items.length === 0) {
        toast.error("La orden seleccionada no tiene items. No se puede facturar.");
        return;
      }
      
      await createFactura(dataToSubmit);
      toast.success('Factura registrada con éxito. Plan de pagos generado.');
      setIsDialogOpen(false);
      loadData(); // Recarga la lista de facturas
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar la factura.');
    }
  };
  
  const openNewDialog = () => {
    form.reset();
    setSelectedOrdenItems([]);
    setIsDialogOpen(true);
  };

  const openDetailDialog = async (factura) => {
    try {
      // Carga los detalles completos de la factura
      const detalles = await getFacturaById(factura.id_factura);
      setSelectedFactura(detalles);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error('Error al cargar los detalles de la factura.');
    }
  };

  const handlePagarCuota = (cuota) => {
    setSelectedCuota(cuota);
    setIsPagarModalOpen(true);
  };

  const handlePagoSuccess = async () => {
    // Recargar el detalle de la factura para ver el estado actualizado
    if (selectedFactura) {
      const detalles = await getFacturaById(selectedFactura.id_factura);
      setSelectedFactura(detalles);
    }
    loadData(); // También recarga la lista principal
  };

  // --- Definir las columnas de la tabla ---
  const columns = [
    {
      accessorKey: 'id_factura',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">#{row.getValue('id_factura')}</div>,
    },
    {
      accessorKey: 'id_orden_compra',
      header: 'Orden Compra',
      cell: ({ row }) => <div className="text-muted-foreground">OC #{row.getValue('id_orden_compra')}</div>,
    },
    {
      accessorKey: 'proveedor_nombre',
      header: 'Proveedor',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('proveedor_nombre') || '-'}</div>,
    },
    {
      accessorKey: 'monto_total',
      header: 'Monto Total',
      cell: ({ row }) => {
        const monto = row.getValue('monto_total');
        if (!monto) return <div className="text-muted-foreground">$ 0</div>;
        return <div className="text-muted-foreground font-medium">$ {parseFloat(monto).toLocaleString()}</div>;
      },
    },
    {
      accessorKey: 'cuotas',
      header: 'Cuotas',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('cuotas') || 0}</div>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const factura = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="outline" 
              onClick={() => openDetailDialog(factura)} 
              className="btn-outline-cosmic h-9 px-4 text-sm"
            >
              Ver Detalle
            </Button>
          </div>
        );
      },
    },
  ];

  // --- Configurar la tabla con React Table ---
  const table = useReactTable({
    data: facturas,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  // --- 6. Renderizado (El JSX) ---
  return (
    <div className="space-y-6">
      {/* --- Cabecera centrada --- */}
      <h2 className="text-3xl font-semibold text-white tracking-tight text-center mb-6">Facturas y Pagos</h2>
      
      {/* --- Botón de "Nuevo" --- */}
      <div className="flex justify-end">
        <Button onClick={openNewDialog} className="btn-cosmic">Registrar Factura</Button>
      </div>

      {/* --- Diálogo (Modal) para Crear Factura --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold tracking-tight">Registrar Factura</DialogTitle>
            <DialogDescription className="sr-only">Crear una nueva factura en el sistema</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* --- 1. Selección de Orden de Compra --- */}
              <FormField
                control={form.control} name="orden_compra_id_orden_compra"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Asociar a Orden de Compra</FormLabel>
                    <Select onValueChange={handleOrdenSelect} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}><SelectValue placeholder="Seleccione una Orden de Compra" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {ordenesCompra.map((oc) => (
                          <SelectItem key={oc.id_orden_compra} value={String(oc.id_orden_compra)}>
                            OC-{oc.id_orden_compra} ({oc.proveedor_nombre}) - Fecha: {format(new Date(oc.fecha), "dd/MM/yyyy")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- 2. Items de la Orden (Read-Only) --- */}
              {selectedOrdenItems.length > 0 && (
                <Card className="glass-card border-border/50">
                  <CardHeader style={{ paddingBottom: '12px' }}><CardTitle className="text-sm font-semibold">Items a Facturar</CardTitle></CardHeader>
                  <CardContent style={{ paddingTop: '0' }}>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedOrdenItems.map(item => (
                        <li key={item.id_linea_orden_compra}>
                          ({item.cantidad}x) {item.marca} {item.modelo} @ ${item.precio_unitario} c/u = ${item.subtotal}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* --- 3. Información de Pago --- */}
              <Card className="glass-card border-border/50">
                <CardHeader style={{ paddingBottom: '12px' }}><CardTitle className="text-sm font-semibold">Información de Pago</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4" style={{ paddingTop: '0' }}>
                  <FormField control={form.control} name="info_pago.cantidad_cuotas" render={({ field }) => (
                    <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><FormLabel className="text-sm font-medium text-foreground">Cantidad de Cuotas</FormLabel><FormControl><Input type="number" min={1} {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="info_pago.primer_vencimiento" render={({ field }) => (
                    <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <FormLabel className="text-sm font-medium text-foreground">Fecha 1er Vencimiento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("text-sm bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all pl-3 text-left font-normal", !field.value && "text-muted-foreground")} style={{ height: '44px' }}>
                              {field.value ? format(field.value, "PPP") : <span>Elegir fecha</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-card border-primary/30" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>

              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild><Button type="button" className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={selectedOrdenItems.length === 0} className="btn-cosmic text-sm h-9">
                  Guardar Factura y Generar Pagos
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- Tabla de Facturas Registradas --- */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          {/* Barra de filtros */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Buscar facturas..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm input-cosmic"
            />
          </div>

          {/* Tabla */}
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="table-header-cosmic hover:bg-transparent border-b border-border/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-foreground font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-muted/50">
                    <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-muted/50 transition-colors border-b border-border/30"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-muted/50">
                    <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                      No hay resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} factura(s) en total
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 px-4 text-sm bg-transparent border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent transition-all hover:shadow-[0_0_15px_rgba(0,245,255,0.3)]"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 px-4 text-sm bg-transparent border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent transition-all hover:shadow-[0_0_15px_rgba(0,245,255,0.3)]"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Modal de Detalle de Factura --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Detalle de Factura #{selectedFactura?.id_factura}</DialogTitle>
            <DialogDescription className="sr-only">Información detallada de la factura</DialogDescription>
          </DialogHeader>
          
          {selectedFactura && (
            <div className="space-y-6">
              {/* Información de la factura */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proveedor</p>
                  <p className="text-base text-foreground">{selectedFactura.proveedor_nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Emisión</p>
                  <p className="text-base text-foreground">{format(new Date(selectedFactura.fecha_emision), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Importe Total</p>
                  <p className="text-base font-semibold text-primary">${selectedFactura.importe?.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <p className="text-base text-foreground">{selectedFactura.estado}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Orden de Compra</p>
                  <p className="text-base text-foreground">{selectedFactura.orden_compra_id_orden_compra}</p>
                </div>
              </div>

              {/* Tabla de items */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Items de la Factura</p>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="table-header-cosmic hover:bg-transparent border-b border-border/50">
                        <TableHead className="text-foreground font-medium">Producto</TableHead>
                        <TableHead className="text-center text-foreground font-medium">Cantidad</TableHead>
                        <TableHead className="text-right text-foreground font-medium">Precio Unit.</TableHead>
                        <TableHead className="text-right text-foreground font-medium">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedFactura.items?.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                          <TableCell className="text-foreground">{item.producto_nombre || `${item.marca} ${item.modelo}`}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{item.cantidad}</TableCell>
                          <TableCell className="text-right text-muted-foreground">${item.precio_unitario?.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium text-foreground">${(item.cantidad * item.precio_unitario).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Plan de Pagos */}
              {selectedFactura.plan_pago && selectedFactura.plan_pago.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Plan de Pagos</p>
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="table-header-cosmic hover:bg-transparent border-b border-border/50">
                          <TableHead className="text-foreground font-medium">Cuota</TableHead>
                          <TableHead className="text-foreground font-medium">Vencimiento</TableHead>
                          <TableHead className="text-right text-foreground font-medium">Monto</TableHead>
                          <TableHead className="text-foreground font-medium">Estado</TableHead>
                          <TableHead className="text-right text-foreground font-medium">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFactura.plan_pago.map((cuota, index) => (
                          <TableRow key={index} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                            <TableCell className="text-foreground">Cuota {cuota.numero_cuota || index + 1}</TableCell>
                            <TableCell className="text-muted-foreground">{format(new Date(cuota.fecha_vencimiento), "dd/MM/yyyy")}</TableCell>
                            <TableCell className="text-right font-medium text-foreground">${parseFloat(cuota.importe).toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                cuota.estado === 'Pagado' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {cuota.estado}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {cuota.estado === 'Pendiente' && (
                                <Button 
                                  onClick={() => handlePagarCuota(cuota)}
                                  className="btn-cosmic h-8 px-3 text-xs"
                                >
                                  💳 Pagar
                                </Button>
                              )}
                              {cuota.estado === 'Pagado' && cuota.fecha_pago && (
                                <span className="text-xs text-muted-foreground">
                                  Pagado: {format(new Date(cuota.fecha_pago), "dd/MM/yyyy")}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)} className="btn-cosmic">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Pago de Cuota */}
      <PagarCuotaModal
        isOpen={isPagarModalOpen}
        onClose={() => setIsPagarModalOpen(false)}
        cuota={selectedCuota}
        onSuccess={handlePagoSuccess}
      />
    </div>
  );
};