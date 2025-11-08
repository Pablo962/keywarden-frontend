import axios from 'axios';

const API_URL = 'http://localhost:4000/api/calificaciones';

/**
 * Registra una nueva calificación
 * @param {object} data { puntaje, comentario, proveedor_id_proveedor, incidente_idincidente }
 */
export const createCalificacion = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

/**
 * Obtiene el promedio de un proveedor (para el dashboard)
 */
export const getPromedioPorProveedor = async (proveedorId) => {
  const response = await axios.get(`${API_URL}/proveedor/${proveedorId}/promedio`);
  return response.data;
};

/**
 * Obtiene todas las calificaciones
 */
export const getAllCalificaciones = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Obtiene todas las calificaciones de un proveedor
 */
export const getCalificacionesPorProveedor = async (proveedorId) => {
  const response = await axios.get(`${API_URL}/proveedor/${proveedorId}`);
  return response.data;
};