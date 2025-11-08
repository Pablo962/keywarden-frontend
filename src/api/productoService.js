import axios from 'axios';

const API_URL = 'http://localhost:4000/api/productos';

/**
 * Obtiene la lista de todos los productos (equipos)
 */
export const getProductos = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Crea un nuevo producto (equipo)
 */
export const createProducto = async (productoData) => {
  const response = await axios.post(API_URL, productoData);
  return response.data;
};

/**
 * Actualiza un producto (equipo) existente
 */
export const updateProducto = async (id, productoData) => {
  const response = await axios.put(`${API_URL}/${id}`, productoData);
  return response.data;
};

/**
 * Realiza una baja lógica de un producto
 */
export const deleteProducto = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};