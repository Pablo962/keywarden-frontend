import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getIncidentes, createIncidente, asignarTecnico, resolverIncidente } from '@/api/incidenteService';
import { getProductos } from '@/api/productoService';
import { getTecnicos } from '@/api/tecnicoService';
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
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// --- 1. Definir los Schemas para CADA formulario ---
const createSchema = z.object({
  descripcion: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)"),
  producto_id_producto: z.string().min(1, "Debe seleccionar un equipo"),
});

const assignSchema = z.object({
  tecnico_id_tecnico: z.string().min(1, "Debe seleccionar un técnico"),
});

const resolveSchema = z.object({
  descripcion: z.string()
    .min(1, "La descripción de la solución es requerida")
    .min(5, "La descripción debe tener al menos 5 caracteres"),
});

export const IncidentesPage = () => {
  // --- 2. Estados ---
  const [incidentes, setIncidentes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estado para manejar los 3 modals
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [isResolveOpen, setResolveOpen] = useState(false);
  
  // Para saber en qué incidente estamos trabajando
  const [selectedIncidente, setSelectedIncidente] = useState(null);

  // --- 3. Definir los 3 Formularios ---
  const createForm = useForm({ resolver: zodResolver(createSchema) });
  const assignForm = useForm({ resolver: zodResolver(assignSchema) });
  const resolveForm = useForm({ resolver: zodResolver(resolveSchema) });

  // --- 4. Cargar todos los datos (Incidentes, Productos, Técnicos) ---
  const loadData = async () => {
    try {
      setLoading(true);
      const [incData, prodData, tecData] = await Promise.all([
        getIncidentes(),
        getProductos(),
        getTecnicos()
      ]);
      setIncidentes(incData);
      setProductos(prodData);
      setTecnicos(tecData);
    } catch (error) {
      toast.error('Error al cargar datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 5. Handlers para abrir los modals ---
  const handleOpenAssign = (incidente) => {
    setSelectedIncidente(incidente);
    assignForm.reset({ tecnico_id_tecnico: '' }); // Resetea el formulario
    setAssignOpen(true);
  };
  
  const handleOpenResolve = (incidente) => {
    setSelectedIncidente(incidente);
    resolveForm.reset({ descripcion: '' }); // Resetea el formulario
    setResolveOpen(true);
  };
  
  const handleOpenCreate = () => {
    createForm.reset();
    setCreateOpen(true);
  };

  // --- 6. Handlers para SUBMIT de los 3 formularios ---
  const onCreateSubmit = async (data) => {
    try {
      const dataToSubmit = { ...data, producto_id_producto: parseInt(data.producto_id_producto) };
      await createIncidente(dataToSubmit);
      toast.success('Incidente reportado con éxito.');
      setCreateOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al reportar incidente.');
    }
  };

  const onAssignSubmit = async (data) => {
    try {
      await asignarTecnico(selectedIncidente.idincidente, data.tecnico_id_tecnico);
      toast.success('Técnico asignado con éxito.');
      setAssignOpen(false);
      assignForm.reset(); 
      loadData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al asignar técnico.');
    }
  };

  const onResolveSubmit = async (data) => {
    try {
      await resolverIncidente(selectedIncidente.idincidente, data.descripcion);
      toast.success('Incidente resuelto con éxito.');
      setResolveOpen(false);
      resolveForm.reset(); 
      loadData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al resolver incidente.');
    }
  };

  // --- Definir las columnas de la tabla ---
  const columns = [
    {
      accessorKey: 'idincidente',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">#{row.getValue('idincidente')}</div>,
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => <div className="text-muted-foreground max-w-xs truncate">{row.getValue('descripcion')}</div>,
    },
    {
      accessorKey: 'producto_nombre',
      header: 'Equipo',
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.marca || '-'} {row.original.modelo || ''}</div>,
    },
    {
      accessorKey: 'tecnico_nombre',
      header: 'Técnico',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('tecnico_nombre') || 'Sin asignar'}</div>,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado');
        const badgeClass = estado === 'Abierto' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                           estado === 'En Progreso' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                           'bg-green-500/20 text-green-500 border-green-500/30';
        return <Badge className={badgeClass}>{estado}</Badge>;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const incidente = row.original;
        return (
          <div className="text-right space-x-2">
            {incidente.estado === 'Abierto' && (
              <Button 
                variant="outline" 
                onClick={() => handleOpenAssign(incidente)} 
                className="btn-outline-cosmic h-9 px-4 text-sm"
              >
                Asignar
              </Button>
            )}
            {incidente.estado === 'En Progreso' && (
              <Button 
                variant="outline" 
                onClick={() => handleOpenResolve(incidente)} 
                className="btn-outline-cosmic h-9 px-4 text-sm"
              >
                Resolver
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // --- Configurar la tabla con React Table ---
  const table = useReactTable({
    data: incidentes,
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
 
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-white tracking-tight text-center mb-6">Gestión de Incidentes</h2>
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate} className="btn-cosmic">Reportar Incidente</Button>
      </div>

      {/* --- MODAL 1: CREAR INCIDENTE --- */}
      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold text-foreground">Reportar Nuevo Incidente</DialogTitle>
            <DialogDescription className="sr-only">Crear un nuevo incidente en el sistema</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <FormField
                control={createForm.control} name="producto_id_producto"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Equipo afectado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}><SelectValue placeholder="Seleccione un equipo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {productos.map((p) => (
                          <SelectItem key={p.id_producto} value={String(p.id_producto)}>
                            {p.marca} {p.modelo} (SN: {p.numero_de_serie})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control} name="descripcion"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Descripción del Problema</FormLabel>
                    <FormControl><Textarea placeholder="El equipo no enciende..." {...field} className="input-cosmic min-h-[80px] text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild><Button type="button" className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">Cancelar</Button></DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-9">Reportar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: ASIGNAR TÉCNICO --- */}
      <Dialog open={isAssignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold text-foreground">Asignar Técnico</DialogTitle>
            <DialogDescription className="sr-only">Asignar un técnico al incidente</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground" style={{ marginBottom: '20px' }}>Incidente ID: {selectedIncidente?.idincidente}</p>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <FormField
                control={assignForm.control} name="tecnico_id_tecnico"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Técnico</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}><SelectValue placeholder="Seleccione un técnico" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {tecnicos.map((t) => (
                          <SelectItem key={t.id_tecnico} value={String(t.id_tecnico)}>
                            {t.nombre} (Esp: {t.especialidad})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild><Button type="button" className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">Cancelar</Button></DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-9">Asignar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: RESOLVER INCIDENTE --- */}
      <Dialog open={isResolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold text-foreground">Resolver Incidente</DialogTitle>
            <DialogDescription className="sr-only">Resolver y cerrar el incidente</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground" style={{ marginBottom: '20px' }}>Incidente ID: {selectedIncidente?.idincidente}</p>
          <Form {...resolveForm}>
            <form onSubmit={resolveForm.handleSubmit(onResolveSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <FormField
                control={resolveForm.control} name="descripcion"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Descripción de la Solución</FormLabel>
                    <FormControl><Textarea placeholder="Se reemplazó la fuente..." {...field} className="input-cosmic min-h-[80px] text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild><Button type="button" className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">Cancelar</Button></DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-9">Marcar como Resuelto</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- Tabla de Incidentes --- */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          {/* Barra de filtros */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Buscar incidentes..."
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
              {table.getFilteredRowModel().rows.length} incidente(s) en total
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="btn-outline-cosmic h-9 px-4 text-sm"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="btn-outline-cosmic h-9 px-4 text-sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Modal para ASIGNAR Técnico --- */}
      <Dialog open={isAssignOpen} onOpenChange={(open) => {
        setAssignOpen(open);
        if (!open) assignForm.reset(); 
      }}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '20px' }}>
            <DialogTitle className="text-lg font-semibold tracking-tight">Asignar Técnico</DialogTitle>
            <DialogDescription className="sr-only">Asignar un técnico al incidente</DialogDescription>
          </DialogHeader>

          {selectedIncidente && (
            <div className="space-y-2 py-3 border-b border-border/30" style={{ marginBottom: '20px' }}>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Incidente ID:</span>
                <span className="font-semibold">#{selectedIncidente.idincidente}</span>
              </div>
            </div>
          )}

          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <FormField
                control={assignForm.control}
                name="tecnico_id_tecnico"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <FormLabel className="text-sm font-medium">Técnico (Esp: {selectedIncidente?.especialidad || 'N/A'})</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                          <SelectValue placeholder="Seleccione un técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-primary/30">
                        {tecnicos.map((tec) => (
                          <SelectItem key={tec.id_tecnico} value={String(tec.id_tecnico)}>
                            {tec.nombre} (Esp: {tec.especialidad})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter style={{ marginTop: '20px' }}>
                <Button 
                  type="submit" 
                  className="btn-cosmic w-full"
                  style={{ height: '44px' }}
                >
                  Asignar
                </Button>
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2 btn-outline-cosmic"
                    style={{ height: '44px' }}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- Modal para RESOLVER Incidente --- */}
      <Dialog open={isResolveOpen} onOpenChange={(open) => {
        setResolveOpen(open);
        if (!open) resolveForm.reset(); 
      }}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '20px' }}>
            <DialogTitle className="text-lg font-semibold tracking-tight">Resolver Incidente</DialogTitle>
            <DialogDescription className="sr-only">Marcar el incidente como resuelto</DialogDescription>
          </DialogHeader>

          {selectedIncidente && (
            <div className="space-y-2 py-3 border-b border-border/30" style={{ marginBottom: '20px' }}>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Incidente ID:</span>
                <span className="font-semibold">#{selectedIncidente.idincidente}</span>
              </div>
            </div>
          )}

          <Form {...resolveForm}>
            <form onSubmit={resolveForm.handleSubmit(onResolveSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <FormField
                control={resolveForm.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <FormLabel className="text-sm font-medium">Descripción de la Solución *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa cómo se resolvió el problema..."
                        className="input-cosmic text-sm min-h-[120px] resize-none"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter style={{ marginTop: '20px' }}>
                <Button 
                  type="submit" 
                  className="btn-cosmic w-full"
                  style={{ height: '44px' }}
                >
                  Marcar como Resuelto
                </Button>
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2 btn-outline-cosmic"
                    style={{ height: '44px' }}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};