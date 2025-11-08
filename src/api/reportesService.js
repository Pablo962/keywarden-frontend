import axios from 'axios';

const API_URL = 'http://localhost:4000/api/reportes';

/**
 * Obtiene el ranking de proveedores por calificación (R3).
 * @param {number} limit - Cantidad de proveedores a mostrar (default: 10)
 */
export const getRankingProveedores = async (limit = 10) => {
  const response = await axios.get(`${API_URL}/ranking-proveedores`, {
    params: { limit }
  });
  return response.data;
};

/**
 * Obtiene el historial de incidentes de un proveedor (R7).
 * @param {number} proveedorId - ID del proveedor
 */
export const getIncidentesPorProveedor = async (proveedorId) => {
  const response = await axios.get(`${API_URL}/incidentes/proveedor/${proveedorId}`);
  return response.data;
};

/**
 * Obtiene el historial de incidentes de un producto (R7).
 * @param {number} productoId - ID del producto
 */
export const getIncidentesPorProducto = async (productoId) => {
  const response = await axios.get(`${API_URL}/incidentes/producto/${productoId}`);
  return response.data;
};

/**
 * Obtiene el reporte de desempeño de técnicos (R4/R7).
 */
export const getDesempenoTecnicos = async () => {
  const response = await axios.get(`${API_URL}/tecnicos/desempeno`);
  return response.data;
};

/**
 * Obtiene el reporte financiero detallado de un proveedor (R5/R9).
 * @param {number} proveedorId - ID del proveedor
 */
export const getFinancieroPorProveedor = async (proveedorId) => {
  const response = await axios.get(`${API_URL}/financiero/proveedor/${proveedorId}`);
  return response.data;
};

/**
 * Obtiene productos filtrados por estado de garantía (R2).
 * @param {string} estado - 'todos', 'vencida', 'por_vencer', 'vigente'
 */
export const getProductosGarantia = async (estado = 'todos') => {
  const response = await axios.get(`${API_URL}/productos/garantias`, {
    params: { estado }
  });
  return response.data;
};
