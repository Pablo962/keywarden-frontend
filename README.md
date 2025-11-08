# ��� Keywarden Frontend

Aplicación web moderna para la gestión integral de proveedores de equipamiento informático, construida con React y Vite.

## ✨ Características
- ��� **Autenticación y autorización** con roles (Admin/Consultor)
- ��� **Dashboard ejecutivo** con KPIs en tiempo real
- ��� **Gestión de proveedores** con sistema de calificaciones
- ���️ **Control de técnicos** y calificaciones de servicio
- ��� **Inventario de equipos** con seguimiento de garantías
- ��� **Gestión de incidentes** y servicios técnicos
- ��� **Control de facturas** y órdenes de compra
- ��� **Reportes ejecutivos** con análisis de garantías
- ��� **Interfaz moderna** con tema oscuro y efectos glass-morphism

## ���️ Stack Tecnológico

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes de UI

## ��� Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Backend Keywarden ejecutándose

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd frontend-keywarden
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:
```env
VITE_API_URL=http://localhost:4000/api
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## ��� Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## ���️ Estructura del Proyecto

```
frontend-keywarden/
├── src/
│   ├── api/              # Servicios de API
│   ├── components/       # Componentes reutilizables
│   │   ├── layout/       # Componentes de layout
│   │   └── ui/           # Componentes UI (shadcn)
│   ├── config/           # Configuración
│   ├── context/          # Context API (Auth)
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Páginas de la aplicación
│   ├── routes/           # Configuración de rutas
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Punto de entrada
├── public/               # Archivos estáticos
└── index.html            # HTML principal
```

## ��� Módulos Principales

### Dashboard
Panel ejecutivo con métricas clave:
- Total de proveedores y técnicos
- Promedio de calificaciones
- Incidentes pendientes
- Alertas de garantías

### Proveedores
- Lista completa de proveedores
- CRUD de proveedores
- Calificaciones y estadísticas
- Estados: Activo/Inactivo

### Técnicos
- Gestión de técnicos autorizados
- Vinculación con proveedores
- Especialidades
- Estados: Activo/Inactivo

### Calificaciones
Sistema dual de calificaciones:
- Calificaciones de técnicos
- Calificaciones de proveedores
- Indicadores de ya calificado
- Paginación

### Incidentes
- Registro de incidentes
- Asignación de técnicos
- Estados: Registrado, En Proceso, Resuelto, Cancelado
- Calificación de servicio

### Productos (Equipos)
- Inventario de equipamiento
- Seguimiento de garantías
- Asociación con proveedores
- Estados: Disponible, En Uso, En Reparación, Dado de Baja

### Facturas
- Gestión de facturas
- Órdenes de compra
- Pagos en cuotas
- Vencimientos

### Reportes Ejecutivos
- Estado de garantías (Vigentes, Por Vencer, Vencidas)
- Filtros dinámicos
- Información detallada de productos

## ��� Estilos y Temas

La aplicación utiliza un sistema de diseño personalizado con:

- **Tema oscuro** por defecto
- **Glass-morphism effects** para cards
- **Botones personalizados** (btn-cosmic, btn-outline-cosmic)
- **Gradientes** y efectos de hover
- **Badges** con colores semánticos
- **Responsive design**

## ��� Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

1. Login con email y contraseña
2. Token almacenado en localStorage
3. Token incluido en headers de todas las peticiones
4. Protección de rutas con ProtectedRoute
5. Logout limpia el token

### Roles de Usuario

- **Admin**: Acceso completo a todas las funcionalidades
- **Consultor**: Acceso de solo lectura

## ��� Integración con Backend

El frontend se comunica con el backend a través de servicios en `src/api/`:

```javascript
// Ejemplo de uso
import { getProveedores } from '../api/proveedorService';

const proveedores = await getProveedores();
```

Cada servicio maneja:
- Peticiones HTTP con Axios
- Headers de autenticación
- Manejo de errores
- Transformación de datos

## ��� Componentes UI

Utilizamos **shadcn/ui** para componentes base:

- Card, CardHeader, CardContent
- Button
- Badge
- Tabs, TabsList, TabsTrigger, TabsContent
- Input, Label, Select
- Table
- Y más...

## ��� Despliegue

### Build para Producción

```bash
npm run build
```

Los archivos optimizados se generan en la carpeta `dist/`

### Variables de Entorno para Producción

```env
VITE_API_URL=https://tu-backend.com/api
```


