import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '@/api/proveedorService';
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
import { toast } from 'sonner'; // Para notificaciones
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// --- 1. Definir el "schema" (reglas) del formulario con Zod ---
const proveedorSchema = z.object({
  razon_social: z.string().min(3, "La razón social es requerida"),
  cuit: z.string()
    .refine((val) => {
      // Si está vacío, es inválido
      if (!val || val.trim() === '') return false;
      // Permitir formato con guiones (XX-XXXXXXXX-X) o sin guiones (11 dígitos)
      const sinGuiones = val.replace(/-/g, '');
      return sinGuiones.length === 11 && /^\d+$/.test(sinGuiones);
    }, "El CUIT debe tener 11 dígitos (puede incluir guiones)"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
});

export const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null); // Para saber si estamos editando o creando
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // --- 2. Configuración del formulario (react-hook-form) ---
  const form = useForm({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      razon_social: '',
      cuit: '',
      email: '',
      telefono: '',
    },
  });

  // --- 3. Cargar datos al iniciar la página ---
  const loadProveedores = async () => {
    try {
      setLoading(true);
      const data = await getProveedores();
      setProveedores(data);
    } catch (error) {
      toast.error('Error al cargar proveedores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  // --- 4. Funciones de manejo (Submit, Editar, Borrar) ---
  const onSubmit = async (data) => {
    try {
      if (editingProveedor) {
        // --- Lógica de ACTUALIZAR (PUT) ---
        // (Solo enviamos los campos que permite el backend)
        const updateData = {
          razon_social: data.razon_social,
          email: data.email,
          telefono: data.telefono,
        };
        await updateProveedor(editingProveedor.id_proveedor, updateData);
        toast.success('Proveedor actualizado con éxito.');
      } else {
        // --- Lógica de CREAR (POST) ---
        await createProveedor(data);
        toast.success('Proveedor creado con éxito.');
      }
      
      // Resetea el formulario, cierra el modal y recarga la tabla
      form.reset();
      setIsDialogOpen(false);
      setEditingProveedor(null);
      loadProveedores();
      
    } catch (error) {
      // Maneja el error de CUIT duplicado del backend
      toast.error(error.response?.data?.message || 'Error al guardar el proveedor.');
    }
  };

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    // Carga los datos del proveedor en el formulario
    form.reset({
      razon_social: proveedor.razon_social,
      cuit: proveedor.cuit, // El CUIT no se puede editar, pero lo mostramos
      email: proveedor.email,
      telefono: proveedor.telefono,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea dar de baja a este proveedor?')) {
      try {
        await deleteProveedor(id);
        toast.success('Proveedor dado de baja (baja lógica).');
        loadProveedores(); // Recarga la tabla
      } catch (error) {
        toast.error('Error al eliminar el proveedor.');
      }
    }
  };
  
  const openNewProveedorDialog = () => {
    form.reset(); // Limpia el formulario
    setEditingProveedor(null); // Asegura que estemos en modo "crear"
    setIsDialogOpen(true);
  };

  // --- Definir las columnas de la tabla ---
  const columns = [
    {
      accessorKey: 'razon_social',
      header: 'Razón Social',
      cell: ({ row }) => <div className="font-medium">{row.getValue('razon_social')}</div>,
    },
    {
      accessorKey: 'cuit',
      header: 'CUIT',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('cuit')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('telefono') || '-'}</div>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const proveedor = row.original;
        return (
          <div className="text-right space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleEdit(proveedor)} 
              className="btn-outline-cosmic h-9 px-4 text-sm"
            >
              Editar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(proveedor.id_proveedor)} 
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
    data: proveedores,
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
      <h2 className="text-3xl font-semibold text-white tracking-tight text-center mb-6">Gestión de Proveedores</h2>
      
      {/* --- Botón de "Nuevo" --- */}
      <div className="flex justify-end">
        <Button onClick={openNewProveedorDialog} className="btn-cosmic">Nuevo Proveedor</Button>
      </div>

      {/* --- Diálogo (Modal) para Crear/Editar --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="modal-compact glass-card border-primary/30">
          <DialogHeader style={{ marginBottom: '28px' }}>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingProveedor ? 'Editar información del proveedor' : 'Crear un nuevo proveedor en el sistema'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <FormField
                control={form.control}
                name="razon_social"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Razón Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Proveedor S.A." {...field} className="input-cosmic text-sm" style={{ height: '44px' }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cuit"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">CUIT</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="30123456789" 
                        {...field} 
                        className="input-cosmic text-sm"
                        style={{ height: '44px' }}
                        disabled={!!editingProveedor} 
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
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contacto@proveedor.com" {...field} className="input-cosmic text-sm" style={{ height: '44px' }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormLabel className="text-sm font-medium text-foreground">Teléfono (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="3815551234" {...field} className="input-cosmic text-sm" style={{ height: '44px' }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter style={{ marginTop: '28px', gap: '16px' }}>
                <DialogClose asChild>
                  <Button type="button" className="text-sm h-10 px-6 bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted/20 hover:border-muted-foreground/50 transition-all">Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="btn-cosmic text-sm h-10 px-6">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- Tabla de Proveedores --- */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          {/* Barra de filtros */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Buscar proveedores..."
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
              {table.getFilteredRowModel().rows.length} proveedor(es) en total
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
