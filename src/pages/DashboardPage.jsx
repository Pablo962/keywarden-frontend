// Dashboard con KPIs de colores - v2.0
import { useEffect, useState } from 'react';
import { getReporteEjecutivo } from '@/api/dashboardService';
import { getAlertasDeVencimiento } from '@/api/alertasService';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Users, 
  Package, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Star, 
  DollarSign, 
  AlertTriangle,
  TrendingUp 
} from 'lucide-react';
import { format } from 'date-fns';

export const DashboardPage = () => {
  const [reporte, setReporte] = useState(null);
  const [alertas, setAlertas] = useState(null); // <-- 3. AÑADE ESTADO PARA ALERTAS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // --- 4. LLAMA A AMBOS ENDPOINTS EN PARALELO ---
        const [reporteData, alertasData] = await Promise.all([
          getReporteEjecutivo(),
          getAlertasDeVencimiento(30) // Traemos alertas a 30 días
        ]);
        
        setReporte(reporteData);
        setAlertas(alertasData);
      } catch (err) {
        setError('No se pudo cargar el reporte. Asegúrese de que el backend esté funcionando.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-cosmic text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!reporte || !alertas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No hay datos para mostrar.</p>
      </div>
    );
  }

  // Desestructuramos para fácil acceso
  const { kpis_generales, kpis_financieros, kpis_servicio, kpis_desempeno } = reporte;

  // Datos de ejemplo para el gráfico de facturación mensual
  // En producción, esto vendría del backend
  const facturacionData = [
    { mes: 'May', monto: 85000, label: 'Mayo 2024' },
    { mes: 'Jun', monto: 120000, label: 'Junio 2024' },
    { mes: 'Jul', monto: 95000, label: 'Julio 2024' },
    { mes: 'Ago', monto: 140000, label: 'Agosto 2024' },
    { mes: 'Sep', monto: 110000, label: 'Septiembre 2024' },
    { mes: 'Oct', monto: 160000, label: 'Octubre 2024' },
  ];

  const formatCurrency = (value) => `$${(value / 1000).toFixed(0)}k`;
  
  // Componente personalizado para el Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card border-primary/30 p-3">
          <p className="text-sm font-medium text-foreground">{payload[0].payload.label}</p>
          <p className="text-lg font-semibold text-primary">
            ${payload[0].value.toLocaleString('es-AR')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          <span className="text-primary"></span><span className="text-accent">Dashboard</span>
        </h2>
        <p className="text-muted-foreground text-lg">Sistema de Gestión Empresarial</p>
      </div>
      
      {/* --- Grid Layout Principal: Izquierda (KPIs) + Derecha (Deuda) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: KPIs Principales (2/3 del ancho) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* --- KPIs Generales (4 cards) --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Proveedores Activos */}
            <Card className="glass-card border-l-4 border-accent hover:shadow-[0_0_30px_rgba(0,245,255,0.2)] transition-all duration-300">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 mb-3">
                  +24%
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">{kpis_generales.proveedores_activos}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Proveedores</div>
                </div>
              </CardContent>
            </Card>

            {/* Productos en Stock */}
            <Card className="glass-card border-l-4 border-primary hover:shadow-[0_0_30px_rgba(255,0,110,0.2)] transition-all duration-300">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 mb-3">
                  +11%
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">{kpis_generales.productos_registrados}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Equipos</div>
                </div>
              </CardContent>
            </Card>

            {/* Incidentes Abiertos */}
            <Card className="glass-card border-l-4 border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 mb-3">
                  ACTIVO
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">{kpis_generales.incidentes_abiertos}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Incidentes</div>
                </div>
              </CardContent>
            </Card>

            {/* Cuotas Vencidas */}
            <Card className="glass-card border-l-4 border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all duration-300">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 mb-3">
                  CRÍTICO
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">{kpis_financieros.cuotas_vencidas}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vencidas</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- Gráfico de Facturación --- */}
          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">Facturación Mensual</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={facturacionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(255,0,110,0.1)" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="mes" 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13 }}
                    axisLine={{ stroke: 'rgba(255,0,110,0.3)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    tickFormatter={formatCurrency}
                    axisLine={{ stroke: 'rgba(139,92,246,0.3)' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                  <Bar dataKey="monto" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {facturacionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === facturacionData.length - 1 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.6)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* --- KPIs de Servicio (3 cards) --- */}
          <div className="grid grid-cols-3 gap-4">
            {/* Tiempo de Respuesta */}
            <Card className="glass-card border-t-4 border-accent">
              <CardContent className="p-5">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center ring-2 ring-accent/30">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-foreground">{kpis_servicio.tiempo_respuesta_promedio}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">Respuesta</div>
                </div>
              </CardContent>
            </Card>

            {/* Tiempo de Resolución */}
            <Card className="glass-card border-t-4 border-green-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center ring-2 ring-green-500/30">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-foreground">{kpis_servicio.tiempo_resolucion_promedio}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">Resolución</div>
                </div>
              </CardContent>
            </Card>

            {/* Calificación Promedio */}
            <Card className="glass-card border-t-4 border-yellow-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center ring-2 ring-yellow-500/30">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-foreground">
                    Proveedores: {kpis_desempeno.calificacion_promedio_proveedores}
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    Técnicos: {kpis_desempeno.calificacion_promedio_tecnicos}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">Calificaciones</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Columna Derecha: Deuda Total (1/3 del ancho) --- */}
        <div className="lg:col-span-1">
          <Card className="glass-card border-2 border-purple-500/30 h-full hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-300">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center ring-4 ring-purple-500/30">
                    <DollarSign className="w-10 h-10 text-purple-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest">Deuda Total</p>
                  <p className="text-5xl font-bold text-foreground leading-none">
                    ${(kpis_financieros.total_deuda_pendiente / 1000).toFixed(0)}
                    <span className="text-2xl text-muted-foreground">k</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Pendiente de pago</p>
                </div>
                <div className="pt-4 border-t border-purple-500/20">
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-purple-400 font-medium">Actualizado en tiempo real</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* --- Tabla de Alertas (Ancho completo abajo) --- */}
      <Card className="glass-card border-red-500/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-red-400">Alertas de Vencimiento</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Pagos próximos a vencer en {alertas.buscando_en_proximos_dias} días</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="table-header-cosmic hover:bg-transparent border-b border-border/50">
                  <TableHead className="text-foreground font-medium">Proveedor</TableHead>
                  <TableHead className="text-foreground font-medium">Factura ID</TableHead>
                  <TableHead className="text-foreground font-medium">N° Cuota</TableHead>
                  <TableHead className="text-foreground font-medium">Fecha Vencimiento</TableHead>
                  <TableHead className="text-right text-foreground font-medium">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertas.cantidad_alertas === 0 ? (
                  <TableRow className="hover:bg-muted/50">
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      ✓ No hay vencimientos en los próximos {alertas.buscando_en_proximos_dias} días.
                    </TableCell>
                  </TableRow>
                ) : (
                  alertas.vencimientos.map((alerta) => (
                    <TableRow key={alerta.id_plan_pago} className="hover:bg-muted/50 transition-colors border-b border-border/30">
                      <TableCell className="font-medium text-foreground">{alerta.proveedor_nombre}</TableCell>
                      <TableCell className="text-muted-foreground">Factura #{alerta.id_factura}</TableCell>
                      <TableCell className="text-muted-foreground">{alerta.numero_cuota}</TableCell>
                      <TableCell className="text-red-400 font-medium">
                        {format(new Date(alerta.fecha_vencimiento), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">$ {alerta.importe.toLocaleString('es-AR')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};