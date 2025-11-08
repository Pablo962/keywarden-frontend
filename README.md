# Ìæ® Keywarden Frontend

Aplicaci√≥n web moderna para la gesti√≥n integral de proveedores de equipamiento inform√°tico, construida con React y Vite.

## ‚ú® Caracter√≠sticas

- Ì¥ê **Autenticaci√≥n y autorizaci√≥n** con roles (Admin/Consultor)
- Ì≥ä **Dashboard ejecutivo** con KPIs en tiempo real
- Ì±• **Gesti√≥n de proveedores** con sistema de calificaciones
- Ìª†Ô∏è **Control de t√©cnicos** y calificaciones de servicio
- Ì≤ª **Inventario de equipos** con seguimiento de garant√≠as
- Ì≥ù **Gesti√≥n de incidentes** y servicios t√©cnicos
- Ì≤∞ **Control de facturas** y √≥rdenes de compra
- Ì≥à **Reportes ejecutivos** con an√°lisis de garant√≠as
- Ìæ≠ **Interfaz moderna** con tema oscuro y efectos glass-morphism

## Ìª†Ô∏è Stack Tecnol√≥gico

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router** - Navegaci√≥n
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes de UI

## Ì∫Ä Instalaci√≥n

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Backend Keywarden ejecut√°ndose

### Pasos de Instalaci√≥n

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

Crear archivo `.env` en la ra√≠z:
```env
VITE_API_URL=http://localhost:4000/api
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicaci√≥n estar√° disponible en `http://localhost:5173`

## Ì≥¶ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicaci√≥n para producci√≥n
- `npm run preview` - Previsualiza la build de producci√≥n
- `npm run lint` - Ejecuta el linter

## ÌøóÔ∏è Estructura del Proyecto

```
frontend-keywarden/
‚îú‚îÄ‚îÄ src/
‚îÇ   ‚îú‚îÄ‚îÄ api/              # Servicios de API
‚îÇ   ‚îú‚îÄ‚îÄ components/       # Componentes reutilizables
‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ layout/       # Componentes de layout
‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ ui/           # Componentes UI (shadcn)
‚îÇ   ‚îú‚îÄ‚îÄ config/           # Configuraci√≥n
‚îÇ   ‚îú‚îÄ‚îÄ context/          # Context API (Auth)
‚îÇ   ‚îú‚îÄ‚îÄ hooks/            # Custom hooks
‚îÇ   ‚îú‚îÄ‚îÄ pages/            # P√°ginas de la aplicaci√≥n
‚îÇ   ‚îú‚îÄ‚îÄ routes/           # Configuraci√≥n de rutas
‚îÇ   ‚îú‚îÄ‚îÄ App.jsx           # Componente principal
‚îÇ   ‚îî‚îÄ‚îÄ main.jsx          # Punto de entrada
‚îú‚îÄ‚îÄ public/               # Archivos est√°ticos
‚îî‚îÄ‚îÄ index.html            # HTML principal
```

## ÌæØ M√≥dulos Principales

### Dashboard
Panel ejecutivo con m√©tricas clave:
- Total de proveedores y t√©cnicos
- Promedio de calificaciones
- Incidentes pendientes
- Alertas de garant√≠as

### Proveedores
- Lista completa de proveedores
- CRUD de proveedores
- Calificaciones y estad√≠sticas
- Estados: Activo/Inactivo

### T√©cnicos
- Gesti√≥n de t√©cnicos autorizados
- Vinculaci√≥n con proveedores
- Especialidades
- Estados: Activo/Inactivo

### Calificaciones
Sistema dual de calificaciones:
- Calificaciones de t√©cnicos
- Calificaciones de proveedores
- Indicadores de ya calificado
- Paginaci√≥n

### Incidentes
- Registro de incidentes
- Asignaci√≥n de t√©cnicos
- Estados: Registrado, En Proceso, Resuelto, Cancelado
- Calificaci√≥n de servicio

### Productos (Equipos)
- Inventario de equipamiento
- Seguimiento de garant√≠as
- Asociaci√≥n con proveedores
- Estados: Disponible, En Uso, En Reparaci√≥n, Dado de Baja

### Facturas
- Gesti√≥n de facturas
- √ìrdenes de compra
- Pagos en cuotas
- Vencimientos

### Reportes Ejecutivos
- Estado de garant√≠as (Vigentes, Por Vencer, Vencidas)
- Filtros din√°micos
- Informaci√≥n detallada de productos

## Ìæ® Estilos y Temas

La aplicaci√≥n utiliza un sistema de dise√±o personalizado con:

- **Tema oscuro** por defecto
- **Glass-morphism effects** para cards
- **Botones personalizados** (btn-cosmic, btn-outline-cosmic)
- **Gradientes** y efectos de hover
- **Badges** con colores sem√°nticos
- **Responsive design**

## Ì¥ê Autenticaci√≥n

El sistema utiliza JWT (JSON Web Tokens) para autenticaci√≥n:

1. Login con email y contrase√±a
2. Token almacenado en localStorage
3. Token incluido en headers de todas las peticiones
4. Protecci√≥n de rutas con ProtectedRoute
5. Logout limpia el token

### Roles de Usuario

- **Admin**: Acceso completo a todas las funcionalidades
- **Consultor**: Acceso de solo lectura

## Ì∫¶ Integraci√≥n con Backend

El frontend se comunica con el backend a trav√©s de servicios en `src/api/`:

```javascript
// Ejemplo de uso
import { getProveedores } from '../api/proveedorService';

const proveedores = await getProveedores();
```

Cada servicio maneja:
- Peticiones HTTP con Axios
- Headers de autenticaci√≥n
- Manejo de errores
- Transformaci√≥n de datos

## Ì≥± Componentes UI

Utilizamos **shadcn/ui** para componentes base:

- Card, CardHeader, CardContent
- Button
- Badge
- Tabs, TabsList, TabsTrigger, TabsContent
- Input, Label, Select
- Table
- Y m√°s...

## Ìºê Despliegue

### Build para Producci√≥n

```bash
npm run build
```

Los archivos optimizados se generan en la carpeta `dist/`

### Variables de Entorno para Producci√≥n

```env
VITE_API_URL=https://tu-backend.com/api
```

## Ì≥Ñ Licencia

Este proyecto es privado y confidencial.

## Ì±• Contribuidores

Desarrollado para la gesti√≥n interna de equipamiento inform√°tico.

---

**Nota**: Aseg√∫rate de que el backend est√© ejecut√°ndose antes de iniciar el frontend.
