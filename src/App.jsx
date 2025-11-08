import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { EquiposPage } from './pages/EquiposPage';
import { IncidentesPage } from './pages/IncidentesPage';
import { ProductosPage } from './pages/ProductosPage';
import { TecnicosPage } from './pages/TecnicosPage';  
import { OrdenesCompraPage } from './pages/OrdenesCompraPage';
import { FacturasPage } from './pages/FacturasPage';
import { CalificacionesPage } from './pages/CalificacionesPage';
import ReportesPage from './pages/ReportesPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* Estas son las páginas que se renderizan dentro de MainLayout.
            'index' significa que es la ruta por defecto ('/')
          */}
          <Route index element={<DashboardPage />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="equipos" element={<EquiposPage />} />
          <Route path="tecnicos" element={<TecnicosPage />} />
          <Route path="incidentes" element={<IncidentesPage />} />
          <Route path="ordenes-compra" element={<OrdenesCompraPage />} />
          <Route path="facturas" element={<FacturasPage />} />
          <Route path="calificaciones" element={<CalificacionesPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;
