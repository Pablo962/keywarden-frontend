import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getOrdenesCompra, createOrdenCompra, getOrdenCompraById } from '@/api/ordenCompraService';
import { getProveedores } from '@/api/proveedorService';
import { getProductos } from '@/api/productoService';
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
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// --- 1. Definir los Schemas---
const itemSchema = z.object({
  producto_id_producto: z.string().min(1, "Seleccione un producto."),
  cantidad: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
  precio_unitario: z.coerce.number().min(0.01, "El precio debe ser positivo."),
});

const ordenCompraSchema = z.object({
  proveedor_id_proveedor: z.string().min(1, "Seleccione un proveedor."),
  cuotas: z.coerce.number().min(1, "Debe ser al menos 1 cuota.").max(12),
  items: z.array(itemSchema).min(1, "La orden debe tener al menos un ítem."),
});

export const OrdenesCompraPage = () => {
  // --- 2. Estados ---
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // --- 3. Configuración del Formulario  ---
  const form = useForm({
    resolver: zodResolver(ordenCompraSchema),
    defaultValues: {
      proveedor_id_proveedor: "",
      cuotas: 1,
      items: [{ producto_id_producto: "", cantidad: 1, precio_unitario: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // --- 4. Cargar datos---
  const loadData = async () => {
    try {
      setLoading(true);
      const [ordenesData, provData, prodData] = await Promise.all([
        getOrdenesCompra(),
        getProveedores(),
        getProductos()
      ]);
      setOrdenes(ordenesData);
      setProveedores(provData);
      setProductos(prodData);
    } catch (error) {
      toast.error('Error al cargar datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 5. Handlers  ---
  const onSubmit = async (data) => {
    try {
      const dataToSubmit = {
        ...data,
        proveedor_id_proveedor: parseInt(data.proveedor_id_proveedor),
        items: data.items.map(item => ({
          ...item,
          producto_id_producto: parseInt(item.producto_id_producto)
        }))
      };
      
      await createOrdenCompra(dataToSubmit);
      toast.success('Orden de Compra creada con éxito.');
      setIsDialogOpen(false);
      loadData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la orden.');
    }
  };
  
  const openNewDialog = () => {
    form.reset({ 
      proveedor_id_proveedor: "",
      cuotas: 1,
      items: [{ producto_id_producto: "", cantidad: 1, precio_unitario: 0 }]
    });
    setIsDialogOpen(true);
  };

  const openDetailDialog = async (orden) => {
    try {
      // Carga los detalles completos de la orden (con items)
      const detalles = await getOrdenCompraById(orden.id_orden_compra);
      setSelectedOrden(detalles);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error('Error al cargar los detalles de la orden.');
    }
  };

  // --- Definir las columnas de la tabla ---
  const columns = [
    {
      accessorKey: 'id_orden_compra',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">#OC-{row.getValue('id_orden_compra')}</div>,
    },
    {
      accessorKey: 'proveedor_nombre',
      header: 'Proveedor',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('proveedor_nombre') || '-'}</div>,
    },
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha');
        if (!fecha) return <div className="text-muted-foreground">-</div>;
        try {
          return <div className="text-muted-foreground">{format(new Date(fecha), "dd/MM/yyyy")}</div>;
        } catch {
          return <div className="text-muted-foreground">-</div>;
        }
      },
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
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('cuotas')}</div>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const orden = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="outline" 
              onClick={() => openDetailDialog(orden)} 
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
    data: ordenes,
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

  // --- 6. Renderizado---
  return (
    <div className="space-y-6">
      {/* --- Cabecera centrada --- */}
      <h2 className="text-3xl font-semibold text-white tracking-tight text-center mb-6">Órdenes de Compra</h2>
      
      {/* --- Botón de "Nuevo" --- */}
      <div className="flex justify-end">
        <Button onClick={openNewDialog} className="btn-cosmic">Nueva Orden</Button>
      </div>

      {/* --- Diálogo (Modal) para Crear --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold tracking-tight">Crear Orden de Compra</DialogTitle>
            <DialogDescription className="sr-only">Crear una nueva orden de compra en el sistema</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* --- Cabecera de la Orden --- */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="proveedor_id_proveedor" render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Proveedor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}><SelectValue placeholder="Seleccione un proveedor" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {proveedores.map((p) => (
                          <SelectItem key={p.id_proveedor} value={String(p.id_proveedor)}>{p.razon_social}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="cuotas" render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><FormLabel className="text-sm font-medium text-foreground">Cuotas</FormLabel><FormControl><Input type="number" {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              {/* --- Líneas de Items (Array Dinámico) --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label className="text-sm font-medium text-foreground block">Items</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 p-3 border border-primary/20 rounded-lg bg-black/20">
                      <FormField control={form.control} name={`items.${index}.producto_id_producto`} render={({ field }) => (
                        <FormItem className="flex-1"><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}><SelectValue placeholder="Producto" /></SelectTrigger></FormControl><SelectContent>{productos.map((p) => (<SelectItem key={p.id_producto} value={String(p.id_producto)}>{p.marca} {p.modelo}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name={`items.${index}.cantidad`} render={({ field }) => (
                        <FormItem className="w-20"><FormControl><Input type="number" placeholder="Cant." {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name={`items.${index}.precio_unitario`} render={({ field }) => (
                        <FormItem className="w-28"><FormControl><Input type="number" placeholder="Precio" {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <Button type="button" size="icon" onClick={() => remove(index)} className="bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-border/30 hover:border-border/50 transition-all" style={{ height: '44px', width: '44px' }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" size="sm" onClick={() => append({ producto_id_producto: "", cantidad: 1, precio_unitario: 0 })} className="text-sm bg-transparent border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent transition-all" style={{ height: '44px' }}>
                  Añadir Ítem
                </Button>
              </div>

              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild><Button type="button" className="text-sm h-10 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">Cancelar</Button></DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-10">Guardar Orden</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- Tabla de Órdenes de Compra --- */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          {/* Barra de filtros */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Buscar órdenes..."
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
              {table.getFilteredRowModel().rows.length} orden(es) en total
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

      {/* --- Modal de Detalle de Orden --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">Detalle de Orden de Compra #{selectedOrden?.id_orden_compra}</DialogTitle>
            <DialogDescription className="sr-only">Información detallada de la orden de compra</DialogDescription>
          </DialogHeader>
          
          {selectedOrden && (
            <div className="space-y-6">
              {/* Información de la orden */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proveedor</p>
                  <p className="text-base text-foreground">{selectedOrden.proveedor_nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                  <p className="text-base text-foreground">{format(new Date(selectedOrden.fecha), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cuotas</p>
                  <p className="text-base text-foreground">{selectedOrden.cuotas}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-base font-semibold text-primary">${selectedOrden.total || '0.00'}</p>
                </div>
              </div>

              {/* Tabla de items */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Items de la Orden</p>
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
                      {selectedOrden.items?.map((item, index) => (
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
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)} className="btn-cosmic">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};