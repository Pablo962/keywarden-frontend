import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, ChevronDown, UserCircle2, Shield, UserCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b p-4 relative" style={{
      background: 'linear-gradient(90deg, rgba(10,10,15,0.95) 0%, rgba(20,10,20,0.95) 100%)',
      borderBottom: '1px solid rgba(255, 0, 110, 0.2)',
      boxShadow: '0 2px 20px rgba(255, 0, 110, 0.15)'
    }}>
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="flex justify-between items-center max-w-full mx-auto">
        {/* Título de la sección */}
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{
            textShadow: '0 0 20px rgba(255, 0, 110, 0.3)'
          }}>
            <span className="text-primary">Key</span>
            <span className="text-foreground">Warden</span>
          </h1>
          <p className="text-xs text-muted-foreground tracking-wider uppercase" style={{
            textShadow: '0 0 5px rgba(0, 245, 255, 0.2)'
          }}>Sistema de Gestión</p>
        </div>

        {/* Menú de Usuario - Cyberpunk Style */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(255,0,110,0.1) 0%, rgba(0,245,255,0.05) 100%)',
              border: '1px solid rgba(255, 0, 110, 0.3)',
              boxShadow: '0 0 15px rgba(255, 0, 110, 0.2)'
            }}>
              {/* Efecto hover brillante */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
              
              {/* Ícono de usuario con efecto neón */}
              <div className="relative">
                <UserCircle2 className="w-10 h-10 text-primary transition-all duration-300" style={{
                  filter: 'drop-shadow(0 0 10px rgba(255, 0, 110, 0.8))'
                }} />
                {/* Anillo pulsante */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse" style={{
                  boxShadow: '0 0 15px rgba(255, 0, 110, 0.5)'
                }}></div>
              </div>
              
              {/* Info del usuario con badge de rol */}
              <div className="flex flex-col items-start relative z-10 gap-1">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors" style={{
                  textShadow: '0 0 10px rgba(255, 0, 110, 0.3)'
                }}>{user?.nombre}</span>
                
                {/* Badge del rol con colores diferentes */}
                {user?.rol_id_rol === 1 ? (
                  <Badge className="text-[10px] px-2 py-0 font-bold tracking-wide border" style={{
                    background: 'linear-gradient(135deg, rgba(255,0,110,0.2) 0%, rgba(255,0,110,0.1) 100%)',
                    borderColor: 'rgba(255, 0, 110, 0.5)',
                    color: '#ff006e',
                    textShadow: '0 0 10px rgba(255, 0, 110, 0.8)',
                    boxShadow: '0 0 15px rgba(255, 0, 110, 0.3)'
                  }}>
                    <Shield className="w-3 h-3 mr-1" />
                    ADMIN
                  </Badge>
                ) : (
                  <Badge className="text-[10px] px-2 py-0 font-bold tracking-wide border" style={{
                    background: 'linear-gradient(135deg, rgba(0,245,255,0.2) 0%, rgba(0,245,255,0.1) 100%)',
                    borderColor: 'rgba(0, 245, 255, 0.5)',
                    color: '#00f5ff',
                    textShadow: '0 0 10px rgba(0, 245, 255, 0.8)',
                    boxShadow: '0 0 15px rgba(0, 245, 255, 0.3)'
                  }}>
                    <UserCheck className="w-3 h-3 mr-1" />
                    CONSULTOR
                  </Badge>
                )}
              </div>
              
              {/* Icono chevron */}
              <ChevronDown className="w-4 h-4 text-primary group-hover:translate-y-0.5 transition-all duration-300 relative z-10" style={{
                filter: 'drop-shadow(0 0 5px rgba(255, 0, 110, 0.8))'
              }} />
            </button>
          </DropdownMenuTrigger>
          
          {/* Dropdown Content - Cyberpunk Style */}
          <DropdownMenuContent align="end" className="w-64 p-2 mt-2" style={{
            background: 'linear-gradient(135deg, rgba(22,22,29,0.98) 0%, rgba(16,16,21,0.98) 100%)',
            border: '1px solid rgba(255, 0, 110, 0.3)',
            boxShadow: '0 8px 32px rgba(255, 0, 110, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Header del dropdown con línea decorativa */}
            <div className="relative mb-2">
              <DropdownMenuLabel className="px-3 py-3 rounded-md" style={{
                background: user?.rol_id_rol === 1
                  ? 'linear-gradient(90deg, rgba(255,0,110,0.15) 0%, transparent 100%)'
                  : 'linear-gradient(90deg, rgba(0,245,255,0.15) 0%, transparent 100%)',
                border: user?.rol_id_rol === 1
                  ? '1px solid rgba(255, 0, 110, 0.3)'
                  : '1px solid rgba(0, 245, 255, 0.3)'
              }}>
                <div className="flex items-center gap-3">
                  {user?.rol_id_rol === 1 ? (
                    <Shield className="w-5 h-5 text-primary" style={{
                      filter: 'drop-shadow(0 0 8px rgba(255, 0, 110, 0.8))'
                    }} />
                  ) : (
                    <UserCheck className="w-5 h-5 text-accent" style={{
                      filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.8))'
                    }} />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground" style={{
                      textShadow: '0 0 10px rgba(255, 0, 110, 0.3)'
                    }}>{user?.nombre}</p>
                    <p className="text-xs text-accent font-normal mb-1" style={{
                      textShadow: '0 0 8px rgba(0, 245, 255, 0.3)'
                    }}>{user?.email}</p>
                    
                    {/* Badge del rol en el dropdown */}
                    {user?.rol_id_rol === 1 ? (
                      <Badge className="text-[9px] px-1.5 py-0 font-bold tracking-wider border mt-1" style={{
                        background: 'linear-gradient(135deg, rgba(255,0,110,0.25) 0%, rgba(255,0,110,0.15) 100%)',
                        borderColor: 'rgba(255, 0, 110, 0.6)',
                        color: '#ff006e',
                        textShadow: '0 0 10px rgba(255, 0, 110, 0.8)',
                        boxShadow: '0 0 15px rgba(255, 0, 110, 0.4)'
                      }}>
                        ADMINISTRADOR
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] px-1.5 py-0 font-bold tracking-wider border mt-1" style={{
                        background: 'linear-gradient(135deg, rgba(0,245,255,0.25) 0%, rgba(0,245,255,0.15) 100%)',
                        borderColor: 'rgba(0, 245, 255, 0.6)',
                        color: '#00f5ff',
                        textShadow: '0 0 10px rgba(0, 245, 255, 0.8)',
                        boxShadow: '0 0 15px rgba(0, 245, 255, 0.4)'
                      }}>
                        CONSULTOR
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              {/* Línea separadora con brillo */}
              <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-2" style={{
                boxShadow: '0 0 10px rgba(255, 0, 110, 0.5)'
              }}></div>
            </div>
            
            <DropdownMenuSeparator className="bg-primary/20" />
            
            {/* Botón de Cerrar Sesión con estilo cyberpunk */}
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
                e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <LogOut className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" style={{
                  filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
                }} />
                <span className="text-destructive font-semibold group-hover:translate-x-1 transition-transform" style={{
                  textShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                }}>Cerrar Sesión</span>
              </div>
              
              {/* Efecto hover deslizante */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Línea decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
    </header>
  );
};