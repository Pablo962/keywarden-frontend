import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Wrench, 
  AlertCircle, 
  ShoppingCart, 
  FileText, 
  Star,
  LogOut,
  User,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MainLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Proveedores', url: '/proveedores', icon: Users },
    { title: 'Equipos', url: '/productos', icon: Package },
    { title: 'Técnicos', url: '/tecnicos', icon: Wrench },
    { title: 'Incidentes', url: '/incidentes', icon: AlertCircle },
    { title: 'Órdenes', url: '/ordenes-compra', icon: ShoppingCart },
    { title: 'Facturas', url: '/facturas', icon: FileText },
    { title: 'Calificaciones', url: '/calificaciones', icon: Star },
    { title: 'Reportes', url: '/reportes', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* --- Barra Lateral (Sidebar) - Cyberpunk Style --- */}
      <aside className="w-64 flex flex-col relative" style={{
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 10, 20, 0.98) 100%)',
        borderRight: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        {/* Línea superior */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-accent"></div>
        
        {/* Header del Sidebar */}
        <div className="p-5 border-b border-primary/30 relative" style={{
          background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)'
        }}>
          <div className="flex items-center justify-center mb-2">
            <img 
              src="/logo-keywarden.svg" 
              alt="KeyWarden Logo" 
              className="h-20 w-auto"
            />
          </div>
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-semibold text-center">SISTEMA DE GESTIÓN</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#8b5cf6 #1a1a1f'
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
                style={isActive ? {
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)'
                } : {
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid transparent'
                }}
              >
                {/* Barra lateral activa */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                )}
                
                {/* Ícono */}
                <Icon className="w-5 h-5 transition-all duration-300 relative z-10" />
                
                {/* Texto */}
                <span className={cn(
                  "font-semibold text-sm transition-all duration-300 relative z-10",
                  isActive && "tracking-wide"
                )}>{item.title}</span>
                
                {/* Efecto hover brillante */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
                )}
                
                {/* Borde hover */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg border border-primary/0 group-hover:border-primary/30 transition-all duration-300"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer del Sidebar con Usuario */}
        <div className="p-4 border-t border-accent/30 relative" style={{
          background: 'linear-gradient(0deg, rgba(0,245,255,0.05) 0%, transparent 100%)'
        }}>
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"></div>
          
          {/* Botón de Usuario con Dropdown - Estilo Cyan */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden mb-2" style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(0,245,255,0.08) 100%)',
                border: '1px solid rgba(0, 245, 255, 0.4)'
              }}>
                {/* Efecto hover brillante */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
                
                {/* Ícono de usuario */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center relative z-10" style={{
                    background: 'linear-gradient(135deg, #00f5ff 0%, #00d4e0 100%)'
                  }}>
                    <User className="w-5 h-5 text-background" />
                  </div>
                  {/* Anillo pulsante */}
                  <div className="absolute inset-0 rounded-full border-2 border-accent/60 animate-pulse"></div>
                </div>
                
                {/* Info del usuario */}
                <div className="flex-1 flex flex-col items-start min-w-0 relative z-10">
                  <span className="text-sm font-semibold text-accent group-hover:text-white transition-colors truncate w-full">{user?.nombre}</span>
                  <span className="text-xs text-accent/70 truncate w-full">
                    {user?.rol_id_rol === 1 ? 'Administrador' : 'Consultor'}
                  </span>
                </div>
                
                {/* Icono chevron */}
                <ChevronUp className="w-4 h-4 text-accent group-hover:-translate-y-0.5 group-hover:text-white transition-all duration-300 relative z-10 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            
            {/* Dropdown Content */}
            <DropdownMenuContent side="top" align="start" className="w-56 p-2 mb-2 ml-4" style={{
              background: 'linear-gradient(135deg, rgba(22,22,29,0.98) 0%, rgba(16,16,21,0.98) 100%)',
              border: '1px solid rgba(0, 245, 255, 0.4)',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Header del dropdown */}
              <div className="relative mb-2">
                <DropdownMenuLabel className="px-3 py-3 rounded-md" style={{
                  background: 'linear-gradient(90deg, rgba(0,245,255,0.15) 0%, transparent 100%)',
                  border: '1px solid rgba(0, 245, 255, 0.3)'
                }}>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{user?.nombre}</p>
                      <p className="text-xs text-accent font-normal truncate">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                {/* Línea separadora */}
                <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent my-2"></div>
              </div>
              
              <DropdownMenuSeparator className="bg-accent/20" />
              
              {/* Botón de Cerrar Sesión */}
              <DropdownMenuItem 
                onSelect={logout} 
                className="cursor-pointer px-3 py-2.5 rounded-md transition-all duration-300 group relative overflow-hidden"
                style={{
                  background: 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)';
                  e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.border = '1px solid transparent';
                }}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <LogOut className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
                  <span className="text-destructive font-semibold group-hover:translate-x-1 transition-transform">Cerrar Sesión</span>
                </div>
                
                {/* Efecto hover deslizante */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <p className="text-[10px] text-center text-muted-foreground/70">© 2025 KeyWarden v2.0</p>
        </div>
        
        {/* Línea inferior */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
      </aside>

      {/* --- Contenido Principal --- */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        
        {/* --- Contenido de la Página (sin Navbar) --- */}
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
};
