import axios from 'axios';
// (Axios ya debe tener el token gracias a AuthContext.jsx)

const API_URL = 'http://localhost:4000/api/proveedores';

/**
 * Obtiene la lista de todos los proveedores activos
 */
export const getProveedores = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Crea un nuevo proveedor
 */
export const createProveedor = async (proveedorData) => {
  const response = await axios.post(API_URL, proveedorData);
  return response.data;
};

/**
 * Actualiza un proveedor existente
 */
export const updateProveedor = async (id, proveedorData) => {
  const response = await axios.put(`${API_URL}/${id}`, proveedorData);
  return response.data;
};

/**
 * Realiza una baja lógica de un proveedor
 */
export const deleteProveedor = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};