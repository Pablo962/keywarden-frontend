import { Outlet } from 'react-router-dom';
// (Pronto crearemos y añadiremos el Sidebar y Navbar aquí)

export const MainLayout = () => {
  return (
    <div className="flex h-screen">
      {/* --- Barra Lateral (Sidebar) --- */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Keywarden TFI</h2>
        <nav>
          <ul>
            <li className="mb-2"><a href="/">Dashboard</a></li>
            <li className="mb-2"><a href="/proveedores">Proveedores</a></li>
            <li className="mb-2"><a href="/productos">Productos</a></li>
            <li className="mb-2"><a href="/incidentes">Incidentes</a></li>
          </ul>
        </nav>
      </aside>

      {/* --- Contenido Principal --- */}
      <div className="flex-1 flex flex-col">
        {/* --- Barra Superior (Navbar) --- */}
        <header className="bg-white shadow p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            {/* (Aquí irá el botón de Logout) */}
          </div>
        </header>

        {/* --- Contenido de la Página --- */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {/* Outlet renderiza la página hija (DashboardPage, ProveedoresPage, etc.) */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};