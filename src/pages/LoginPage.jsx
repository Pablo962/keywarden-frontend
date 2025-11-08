import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, UserCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #16161d 50%, #0a0a0f 100%)'
    }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl"></div>
      
      <Card className="w-[440px] z-10 relative" style={{
        background: 'linear-gradient(135deg, rgba(22, 22, 29, 0.95) 0%, rgba(16, 16, 21, 0.95) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
  
        <CardHeader className="space-y-4 pb-6 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img 
              src="/logo-keywarden.svg" 
              alt="KeyWarden Logo" 
              className="h-20 w-auto"
            />
          </div>
          
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground tracking-wide">
              Sistema de Gestión de Proveedores
            </CardTitle>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5 pointer-events-none z-10" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@empresa.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 transition-all duration-300 text-base"
                  style={{
                    background: 'rgba(30, 30, 46, 0.8)',
                    border: '1px solid rgba(45, 45, 61, 1)',
                    color: '#f8f9fa',
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold text-sm">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5 pointer-events-none z-10" />
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 transition-all duration-300 text-base"
                  style={{
                    background: 'rgba(30, 30, 46, 0.8)',
                    border: '1px solid rgba(45, 45, 61, 1)',
                    color: '#f8f9fa',
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="rounded-lg text-sm flex items-center gap-2 p-3 transition-all duration-300" style={{
                background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)'
              }}>
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-destructive">{error}</span>
              </div>
            )}
          </CardContent>
          
          <CardFooter style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem', paddingTop: '0.5rem' }}>
            <Button 
              type="submit" 
              className="w-full h-12 font-semibold text-base group relative overflow-hidden transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              {/* Efecto hover deslizante */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </CardFooter>
        </form>
        
        {/* Línea inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        
        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-[10px] text-muted-foreground/70">© 2025 KeyWarden v2.0</p>
        </div>
      </Card>
    </div>
  );
};