import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTecnicos, createTecnico, updateTecnico, deleteTecnico } from '@/api/tecnicoService';
import { getProveedores } from '@/api/proveedorService'; // Para el dropdown
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

// Importa los componentes de shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// --- 1. Definir el "schema" (reglas) del formulario con Zod ---
// Basado en tu tabla tecnico
const tecnicoSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  documento: z.string().min(7, "El documento es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  especialidad: z.string().min(3, "La especialidad es requerida"),
  vigencia_desde: z.date({ required_error: "La fecha de inicio de vigencia es requerida." }),
  vigencia_hasta: z.date({ required_error: "La fecha de fin de vigencia es requerida." }),
  proveedor_id_proveedor: z.string().min(1, "Debe seleccionar un proveedor"),
});

export const TecnicosPage = () => {
  const [tecnicos, setTecnicos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm({
    resolver: zodResolver(tecnicoSchema),
  });

  // --- 3. Cargar datos (Técnicos Y Proveedores) ---
  const loadData = async () => {
    try {
      setLoading(true);
      const [tecnicosData, proveedoresData] = await Promise.all([
        getTecnicos(),
        getProveedores() // Cargamos proveedores para el <Select>
      ]);
      setTecnicos(tecnicosData);
      setProveedores(proveedoresData);
    } catch (error) {
      toast.error('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 4. Funciones de manejo (Submit, Editar, Borrar) ---
  const onSubmit = async (data) => {
    try {
      const dataToSubmit = {
        ...data,
        proveedor_id_proveedor: parseInt(data.proveedor_id_proveedor),
        vigencia_desde: format(data.vigencia_desde, 'yyyy-MM-dd'),
        vigencia_hasta: format(data.vigencia_hasta, 'yyyy-MM-dd'),
      };

      if (editingTecnico) {
        // --- Lógica de ACTUALIZAR (PUT) ---
        await updateTecnico(editingTecnico.id_tecnico, dataToSubmit);
        toast.success('Técnico actualizado con éxito.');
      } else {
        // --- Lógica de CREAR (POST) ---
        await createTecnico(dataToSubmit);
        toast.success('Técnico creado con éxito.');
      }
      
      form.reset();
      setIsDialogOpen(false);
      setEditingTecnico(null);
      loadData();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el técnico.');
    }
  };

  const handleEdit = (tecnico) => {
    setEditingTecnico(tecnico);
    form.reset({
      ...tecnico,
      proveedor_id_proveedor: String(tecnico.proveedor_id_proveedor),
      vigencia_desde: new Date(tecnico.vigencia_desde),
      vigencia_hasta: new Date(tecnico.vigencia_hasta),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea ELIMINAR FÍSICAMENTE a este técnico? Esta acción no se puede deshacer.')) {
      try {
        await deleteTecnico(id);
        toast.success('Técnico eliminado físicamente.');
        loadData(); // Recarga la tabla
      } catch (error) {
        toast.error('Error al eliminar el técnico.');
      }
    }
  };
  
  const openNewDialog = () => {
    form.reset(); // Limpia el formulario
    setEditingTecnico(null);
    setIsDialogOpen(true);
  };

  // --- Definir las columnas de la tabla ---
  const columns = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <div className="font-medium">{row.getValue('nombre')}</div>,
    },
    {
      accessorKey: 'documento',
      header: 'Documento',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('documento')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'especialidad',
      header: 'Especialidad',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('especialidad')}</div>,
    },
    {
      accessorKey: 'proveedor_nombre',
      header: 'Proveedor',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('proveedor_nombre') || '-'}</div>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const tecnico = row.original;
        return (
          <div className="text-right space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleEdit(tecnico)} 
              className="btn-outline-cosmic h-9 px-4 text-sm"
            >
              Editar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(tecnico.id_tecnico)} 
              className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-colors h-9 px-4 text-sm"
            >
              Baja
            </Button>
          </div>
        );
      },
    },
  ];

  // --- Configurar la tabla con React Table ---
  const table = useReactTable({
    data: tecnicos,
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

  // --- 5. Renderizado (El JSX) ---
  return (
    <div className="space-y-6">
      {/* --- Cabecera centrada --- */}
      <h2 className="text-3xl font-semibold text-white tracking-tight text-center mb-6">Gestión de Técnicos</h2>
      
      {/* --- Botón de "Nuevo" --- */}
      <div className="flex justify-end">
        <Button onClick={openNewDialog} className="btn-cosmic">Nuevo Técnico</Button>
      </div>

      {/* --- Diálogo (Modal) para Crear/Editar --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {editingTecnico ? 'Editar Técnico' : 'Nuevo Técnico'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingTecnico ? 'Editar información del técnico' : 'Crear un nuevo técnico en el sistema'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><FormLabel className="text-sm font-medium text-foreground">Nombre</FormLabel><FormControl><Input {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="documento" render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><FormLabel className="text-sm font-medium text-foreground">Documento (DNI)</FormLabel><FormControl><Input {...field} disabled={!!editingTecnico} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><FormLabel className="text-sm font-medium text-foreground">Email</FormLabel><FormControl><Input type="email" {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><FormLabel className="text-sm font-medium text-foreground">Teléfono</FormLabel><FormControl><Input {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="especialidad" render={({ field }) => (
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><FormLabel className="text-sm font-medium text-foreground">Especialidad</FormLabel><FormControl><Input placeholder="Redes, Hardware, etc." {...field} className="input-cosmic text-sm" style={{ height: '44px' }} /></FormControl><FormMessage /></FormItem>
              )}/>

              {/* --- Proveedor (Select) --- */}
              <FormField control={form.control} name="proveedor_id_proveedor" render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Proveedor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}><SelectValue placeholder="Seleccione un proveedor" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {proveedores.map((prov) => (
                          <SelectItem key={prov.id_proveedor} value={String(prov.id_proveedor)}>
                            {prov.razon_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Vigencia Desde (Date Picker) --- */}
              <FormField control={form.control} name="vigencia_desde" render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Vigencia Desde</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal text-sm bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all", !field.value && "text-muted-foreground")} style={{ height: '44px' }}>
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
                )}
              />
              {/* --- Vigencia Hasta (Date Picker) --- */}
              <FormField control={form.control} name="vigencia_hasta" render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Vigencia Hasta</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal text-sm bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all", !field.value && "text-muted-foreground")} style={{ height: '44px' }}>
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
                )}
              />

              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild>
                  <Button type="button" className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-9">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- Tabla de Técnicos --- */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          {/* Barra de filtros */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Buscar técnicos..."
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
              {table.getFilteredRowModel().rows.length} técnico(s) en total
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
    </div>
  );
};