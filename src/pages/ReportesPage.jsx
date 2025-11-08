import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getProductosGarantia } from '../api/reportesService';
import { AlertTriangle, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const ReportesPage = () => {
  const [loading, setLoading] = useState(false);
  const [productosGarantia, setProductosGarantia] = useState([]);
  const [filtroGarantia, setFiltroGarantia] = useState('por_vencer');

  // Cargar productos por garantía
  const cargarProductosGarantia = async (estado) => {
    setLoading(true);
    try {
      const data = await getProductosGarantia(estado);
      setProductosGarantia(data.productos || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductosGarantia(filtroGarantia);
  }, [filtroGarantia]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          Reportes Ejecutivos
        </h2>
        <p className="text-muted-foreground text-lg">
          Reportes para toma de decisiones estratégicas
        </p>
      </div>

      {/* ESTADO DE GARANTÍAS */}
      <Card className="glass-card border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">Estado de Garantías</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">Seguimiento de garantías de productos</CardDescription>
            </div>
          </div>
          
          {/* Filtros con diseño mejorado */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border/50">
            <Button
              onClick={() => setFiltroGarantia('por_vencer')}
              className={filtroGarantia === 'por_vencer' 
                ? 'btn-cosmic h-10 px-5 text-sm font-medium shadow-lg' 
                : 'glass-card border-border/50 hover:border-yellow-500/50 bg-transparent text-muted-foreground hover:text-yellow-400 h-10 px-5 text-sm transition-all duration-300'}
            >
              <Clock className="w-4 h-4 mr-2" />
              Por Vencer (30 días)
            </Button>
            <Button
              onClick={() => setFiltroGarantia('vencida')}
              className={filtroGarantia === 'vencida' 
                ? 'btn-cosmic h-10 px-5 text-sm font-medium shadow-lg' 
                : 'glass-card border-border/50 hover:border-red-500/50 bg-transparent text-muted-foreground hover:text-red-400 h-10 px-5 text-sm transition-all duration-300'}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Vencidas
            </Button>
            <Button
              onClick={() => setFiltroGarantia('vigente')}
              className={filtroGarantia === 'vigente' 
                ? 'btn-cosmic h-10 px-5 text-sm font-medium shadow-lg' 
                : 'glass-card border-border/50 hover:border-green-500/50 bg-transparent text-muted-foreground hover:text-green-400 h-10 px-5 text-sm transition-all duration-300'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Vigentes
            </Button>
            <Button
              onClick={() => setFiltroGarantia('todos')}
              className={filtroGarantia === 'todos' 
                ? 'btn-cosmic h-10 px-5 text-sm font-medium shadow-lg' 
                : 'glass-card border-border/50 hover:border-primary/50 bg-transparent text-muted-foreground hover:text-primary h-10 px-5 text-sm transition-all duration-300'}
            >
              <Package className="w-4 h-4 mr-2" />
              Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground text-lg">Cargando productos...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {productosGarantia.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No hay productos en este estado
                  </p>
                </div>
              ) : (
                productosGarantia.map((producto) => (
                  <div
                    key={producto.id_producto}
                    className="p-6 rounded-xl glass-card border-l-4 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300"
                    style={{
                      borderLeftColor: producto.estado_garantia.includes('Vencida')
                        ? 'rgb(239, 68, 68)'
                        : producto.estado_garantia.includes('Por Vencer')
                        ? 'rgb(234, 179, 8)'
                        : 'rgb(34, 197, 94)'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            producto.estado_garantia.includes('Vencida')
                              ? 'bg-red-500/10'
                              : producto.estado_garantia.includes('Por Vencer')
                              ? 'bg-yellow-500/10'
                              : 'bg-green-500/10'
                          }`}>
                            <Package className={`w-5 h-5 ${
                              producto.estado_garantia.includes('Vencida')
                                ? 'text-red-400'
                                : producto.estado_garantia.includes('Por Vencer')
                                ? 'text-yellow-400'
                                : 'text-green-400'
                            }`} />
                          </div>
                          <h3 className="font-bold text-lg text-foreground">
                            {producto.marca} {producto.modelo}
                          </h3>
                        </div>
                        <div className="pl-13 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">S/N:</span> {producto.numero_de_serie}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Proveedor:</span> {producto.proveedor_nombre}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-3">
                        <Badge
                          className={`px-3 py-1 text-xs font-semibold ${
                            producto.estado_garantia.includes('Vencida')
                              ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                              : producto.estado_garantia.includes('Por Vencer')
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                          }`}
                        >
                          {producto.estado_garantia}
                        </Badge>
                        <p className={`text-base font-bold ${
                          producto.dias_restantes < 0 
                            ? 'text-red-400' 
                            : producto.dias_restantes <= 30 
                            ? 'text-yellow-400' 
                            : 'text-green-400'
                        }`}>
                          {producto.dias_restantes > 0
                            ? `${producto.dias_restantes} días restantes`
                            : `Vencida hace ${Math.abs(producto.dias_restantes)} días`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportesPage;
