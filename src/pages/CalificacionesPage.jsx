import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createCalificacionTecnico,
  getResumenTecnicos,
  createCalificacionProveedor,
  getResumenProveedores,
} from '@/api/calificacionesService';
import { getIncidentes } from '@/api/incidenteService';
import { getTecnicos } from '@/api/tecnicoService';
import { getProveedores } from '@/api/proveedorService';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Users, Package, Award } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const calificacionTecnicoSchema = z.object({
  tecnico_id_tecnico: z.string().min(1, "Debe seleccionar un técnico"),
  puntaje: z.string().min(1, "Debe asignar una calificación"),
  comentario: z.string().optional(),
});

const calificacionProveedorSchema = z.object({
  proveedor_id_proveedor: z.string().min(1, "Debe seleccionar un proveedor"),
  servicio_postventa: z.string().min(1, "Debe calificar el servicio post-venta"),
  precios: z.string().min(1, "Debe calificar los precios"),
  tiempos_entrega: z.string().min(1, "Debe calificar los tiempos de entrega"),
  calidad_productos: z.string().min(1, "Debe calificar la calidad de productos"),
  comentario: z.string().optional(),
});

export const CalificacionesPage = () => {
  const [activeTab, setActiveTab] = useState('tecnicos');
  const [loading, setLoading] = useState(true);
  const [incidentes, setIncidentes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [resumenTecnicos, setResumenTecnicos] = useState([]);
  const [resumenProveedores, setResumenProveedores] = useState([]);
  
  const [isDialogTecnicoOpen, setIsDialogTecnicoOpen] = useState(false);
  const [isDialogProveedorOpen, setIsDialogProveedorOpen] = useState(false);
  const [selectedIncidenteTecnico, setSelectedIncidenteTecnico] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  
  const [sortingTecnicos, setSortingTecnicos] = useState([]);
  const [globalFilterTecnicos, setGlobalFilterTecnicos] = useState('');

  const formTecnico = useForm({
    resolver: zodResolver(calificacionTecnicoSchema),
    defaultValues: {
      tecnico_id_tecnico: '',
      puntaje: '',
      comentario: '',
    },
  });

  const formProveedor = useForm({
    resolver: zodResolver(calificacionProveedorSchema),
    defaultValues: {
      proveedor_id_proveedor: '',
      servicio_postventa: '',
      precios: '',
      tiempos_entrega: '',
      calidad_productos: '',
      comentario: '',
    },
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        incidentesData,
        tecnicosData,
        proveedoresData,
        resumenTecData,
        resumenProvData,
      ] = await Promise.all([
        getIncidentes(),
        getTecnicos(),
        getProveedores(),
        getResumenTecnicos(),
        getResumenProveedores(),
      ]);

      setIncidentes(incidentesData);
      setTecnicos(tecnicosData);
      setProveedores(proveedoresData);
      setResumenTecnicos(resumenTecData);
      setResumenProveedores(resumenProvData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const incidentesPendientesTecnico = useMemo(() => {
    return incidentes.filter(inc => inc.estado === 'Resuelto');
  }, [incidentes]);

  const handleCalificarTecnico = (incidente) => {
    setSelectedIncidenteTecnico(incidente);
    formTecnico.reset({
      tecnico_id_tecnico: '',
      puntaje: '',
      comentario: '',
    });
    setIsDialogTecnicoOpen(true);
  };

  const onSubmitTecnico = async (data) => {
    try {
      await createCalificacionTecnico({
        tecnico_id_tecnico: parseInt(data.tecnico_id_tecnico),
        puntaje: parseInt(data.puntaje),
        comentario: data.comentario || null,
        incidente_idincidente: selectedIncidenteTecnico.idincidente,
      });

      toast.success('Técnico calificado exitosamente');
      setIsDialogTecnicoOpen(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al calificar técnico:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la calificación');
    }
  };

  const handleCalificarProveedor = (proveedorData) => {
    const proveedorCompleto = proveedores.find(p => p.id_proveedor === proveedorData.id_proveedor);
    
    setSelectedProveedor(proveedorData);
    formProveedor.reset({
      proveedor_id_proveedor: proveedorData.id_proveedor.toString(),
      servicio_postventa: '',
      precios: '',
      tiempos_entrega: '',
      calidad_productos: '',
      comentario: '',
    });
    setIsDialogProveedorOpen(true);
  };

  const onSubmitProveedor = async (data) => {
    try {
      // Necesitamos un incidente resuelto para asociar la calificación
      const incidenteDisponible = incidentes.find(inc => inc.estado === 'Resuelto');
      
      if (!incidenteDisponible) {
        toast.error('No hay incidentes resueltos disponibles para calificar');
        return;
      }

      await createCalificacionProveedor({
        proveedor_id_proveedor: parseInt(data.proveedor_id_proveedor),
        servicio_postventa: parseInt(data.servicio_postventa),
        precios: parseInt(data.precios),
        tiempos_entrega: parseInt(data.tiempos_entrega),
        calidad_productos: parseInt(data.calidad_productos),
        comentario: data.comentario || null,
        incidente_idincidente: incidenteDisponible.idincidente,
      });

      toast.success('Proveedor calificado exitosamente');
      setIsDialogProveedorOpen(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al calificar proveedor:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la calificación');
    }
  };

  // ============================================
  // COLUMNAS - INCIDENTES PENDIENTES TÉCNICOS
  // ============================================
  const columnasIncidentesTecnicos = [
    {
      accessorKey: 'idincidente',
      header: 'ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">#{row.original.idincidente}</span>
          {row.original.ya_calificado === 1 && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-muted-foreground">Calificado</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'producto_nombre',
      header: 'Equipo',
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.descripcion}>
          {row.original.descripcion}
        </div>
      ),
    },
    {
      accessorKey: 'fecha_resolucion',
      header: 'Fecha Resolución',
      cell: ({ row }) => {
        const fecha = row.original.fecha_resolucion;
        return fecha ? format(new Date(fecha), 'dd/MM/yyyy', { locale: es }) : '-';
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const yaCalificado = row.original.ya_calificado === 1;
        return yaCalificado ? (
          <div className="text-sm text-muted-foreground italic">-</div>
        ) : (
          <Button
            size="sm"
            onClick={() => handleCalificarTecnico(row.original)}
            className="btn-cosmic text-sm h-9"
          >
            <Star className="h-4 w-4 mr-1" />
            Calificar
          </Button>
        );
      },
    },
  ];

  // ============================================
  // COLUMNAS - RESUMEN TÉCNICOS
  // ============================================
  const columnasResumenTecnicos = [
    {
      accessorKey: 'tecnico_nombre',
      header: 'Técnico',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.tecnico_nombre}</div>
      ),
    },
    {
      accessorKey: 'total_calificaciones',
      header: 'Total Calificaciones',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.total_calificaciones || 0}</Badge>
      ),
    },
    {
      accessorKey: 'promedio_calificacion',
      header: 'Promedio',
      cell: ({ row }) => {
        const promedio = parseFloat(row.original.promedio_calificacion || 0);
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{promedio.toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'calificaciones_5_estrellas',
      header: '5 Estrellas',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-green-50">
          {row.original.calificaciones_5_estrellas || 0}
        </Badge>
      ),
    },
  ];

  // ============================================
  // COLUMNAS - RESUMEN PROVEEDORES
  // ============================================
  const columnasResumenProveedores = [
    {
      accessorKey: 'proveedor_nombre',
      header: 'Proveedor',
      cell: ({ row }) => {
        const esInactivo = row.original.estado_proveedor === 'Inactivo';
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {row.original.proveedor_nombre}
            </span>
            {esInactivo && (
              <span className="text-xs text-muted-foreground italic">
                .Inactivo
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'promedio_servicio',
      header: 'Servicio',
      cell: ({ row }) => (
        <div className="text-center">{parseFloat(row.original.promedio_servicio || 0).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: 'promedio_precios',
      header: 'Precios',
      cell: ({ row }) => (
        <div className="text-center">{parseFloat(row.original.promedio_precios || 0).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: 'promedio_tiempos',
      header: 'Tiempos',
      cell: ({ row }) => (
        <div className="text-center">{parseFloat(row.original.promedio_tiempos || 0).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: 'promedio_calidad',
      header: 'Calidad',
      cell: ({ row }) => (
        <div className="text-center">{parseFloat(row.original.promedio_calidad || 0).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: 'promedio_general',
      header: 'Promedio General',
      cell: ({ row }) => {
        const promedio = parseFloat(row.original.promedio_general || 0);
        return (
          <div className="flex items-center gap-1 justify-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{promedio.toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const esInactivo = row.original.estado_proveedor === 'Inactivo';
        return (
          <Button
            size="sm"
            onClick={() => handleCalificarProveedor(row.original)}
            disabled={esInactivo}
            className={`btn-cosmic text-sm h-9 ${esInactivo ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <Star className="h-4 w-4 mr-1" />
            Calificar
          </Button>
        );
      },
    },
  ];

  // ============================================
  // TABLAS
  // ============================================
  const tablePendientesTecnicos = useReactTable({
    data: incidentesPendientesTecnico,
    columns: columnasIncidentesTecnicos,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting: sortingTecnicos,
      globalFilter: globalFilterTecnicos,
    },
    onSortingChange: setSortingTecnicos,
    onGlobalFilterChange: setGlobalFilterTecnicos,
  });

  const tableResumenTecnicos = useReactTable({
    data: resumenTecnicos,
    columns: columnasResumenTecnicos,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableResumenProveedores = useReactTable({
    data: resumenProveedores,
    columns: columnasResumenProveedores,
    getCoreRowModel: getCoreRowModel(),
  });

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* --- Cabecera centrada --- */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Calificaciones</h1>
        <p className="text-muted-foreground">Gestiona las calificaciones de técnicos y proveedores</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tecnicos">
            <Users className="h-4 w-4 mr-2" />
            Técnicos
          </TabsTrigger>
          <TabsTrigger value="proveedores">
            <Package className="h-4 w-4 mr-2" />
            Proveedores
          </TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* TAB: TÉCNICOS */}
        {/* ============================================ */}
        <TabsContent value="tecnicos" className="space-y-6">
          {/* Resumen Técnicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Resumen de Desempeño - Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {tableResumenTecnicos.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {tableResumenTecnicos.getRowModel().rows.length ? (
                      tableResumenTecnicos.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columnasResumenTecnicos.length} className="text-center h-24">
                          No hay calificaciones de técnicos aún
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Incidentes Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Incidentes Resueltos - Calificar Técnico</CardTitle>
              <Input
                placeholder="Buscar incidentes..."
                value={globalFilterTecnicos}
                onChange={(e) => setGlobalFilterTecnicos(e.target.value)}
                className="max-w-sm mt-2"
              />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {tablePendientesTecnicos.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {tablePendientesTecnicos.getRowModel().rows.length ? (
                      tablePendientesTecnicos.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columnasIncidentesTecnicos.length} className="text-center h-24">
                          No hay incidentes resueltos disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Mostrando {tablePendientesTecnicos.getRowModel().rows.length} de{' '}
                  {incidentesPendientesTecnico.length} incidentes
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => tablePendientesTecnicos.previousPage()}
                    disabled={!tablePendientesTecnicos.getCanPreviousPage()}
                    className="btn-outline-cosmic h-9 px-4 text-sm"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => tablePendientesTecnicos.nextPage()}
                    disabled={!tablePendientesTecnicos.getCanNextPage()}
                    className="btn-outline-cosmic h-9 px-4 text-sm"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* TAB: PROVEEDORES */}
        {/* ============================================ */}
        <TabsContent value="proveedores" className="space-y-6">
          {/* Solo Resumen Proveedores con botón Calificar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Resumen de Evaluación - Proveedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {tableResumenProveedores.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {tableResumenProveedores.getRowModel().rows.length ? (
                      tableResumenProveedores.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columnasResumenProveedores.length} className="text-center h-24">
                          No hay proveedores registrados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================ */}
      {/* MODAL: CALIFICAR TÉCNICO */}
      {/* ============================================ */}
      <Dialog open={isDialogTecnicoOpen} onOpenChange={setIsDialogTecnicoOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold text-foreground">Calificar Técnico</DialogTitle>
            <DialogDescription>
              Incidente #{selectedIncidenteTecnico?.idincidente} - {selectedIncidenteTecnico?.producto_nombre}
            </DialogDescription>
          </DialogHeader>

          <Form {...formTecnico}>
            <form onSubmit={formTecnico.handleSubmit(onSubmitTecnico)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Técnico */}
              <FormField
                control={formTecnico.control}
                name="tecnico_id_tecnico"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Técnico *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                          <SelectValue placeholder="Selecciona el técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tecnicos.map((tec) => (
                          <SelectItem key={tec.id_tecnico} value={tec.id_tecnico.toString()}>
                            {tec.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Puntaje */}
              <FormField
                control={formTecnico.control}
                name="puntaje"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Calificación (1-5 estrellas) *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                          <SelectValue placeholder="Selecciona la calificación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {'⭐'.repeat(num)} ({num})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comentario */}
              <FormField
                control={formTecnico.control}
                name="comentario"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Comentario (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones sobre el desempeño..."
                        {...field}
                        className="input-cosmic min-h-[80px] text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild>
                  <Button type="button" className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-9">Guardar Calificación</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* MODAL: CALIFICAR PROVEEDOR */}
      {/* ============================================ */}
      <Dialog open={isDialogProveedorOpen} onOpenChange={setIsDialogProveedorOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold text-foreground">Calificar Proveedor</DialogTitle>
            <DialogDescription>
              {selectedProveedor?.proveedor_nombre}
            </DialogDescription>
          </DialogHeader>

          <Form {...formProveedor}>
            <form onSubmit={formProveedor.handleSubmit(onSubmitProveedor)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Grid de Criterios 2x2 */}
              <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                {/* Servicio Post-venta */}
                <FormField
                  control={formProveedor.control}
                  name="servicio_postventa"
                  render={({ field }) => (
                    <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <FormLabel className="text-sm font-medium text-foreground">Servicio Post-venta *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                            <SelectValue placeholder="1-5" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {'⭐'.repeat(num)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Precios */}
                <FormField
                  control={formProveedor.control}
                  name="precios"
                  render={({ field }) => (
                    <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <FormLabel className="text-sm font-medium text-foreground">Precios *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                            <SelectValue placeholder="1-5" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {'⭐'.repeat(num)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tiempos de Entrega */}
                <FormField
                  control={formProveedor.control}
                  name="tiempos_entrega"
                  render={({ field }) => (
                    <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <FormLabel className="text-sm font-medium text-foreground">Tiempos de Entrega *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                            <SelectValue placeholder="1-5" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {'⭐'.repeat(num)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Calidad de Productos */}
                <FormField
                  control={formProveedor.control}
                  name="calidad_productos"
                  render={({ field }) => (
                    <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <FormLabel className="text-sm font-medium text-foreground">Calidad de Productos *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-cosmic text-sm" style={{ height: '44px' }}>
                            <SelectValue placeholder="1-5" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {'⭐'.repeat(num)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Comentario */}
              <FormField
                control={formProveedor.control}
                name="comentario"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Comentario (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones sobre el proveedor..."
                        {...field}
                        className="input-cosmic min-h-[80px] text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild>
                  <Button type="button" className="text-sm h-9 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-9">Guardar Calificación</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
