import axios from 'axios';

const API_URL = 'http://localhost:4000/api/ordenes-compra';

/**
 * Obtiene la lista de todas las órdenes (solo cabeceras)
 */
export const getOrdenesCompra = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Obtiene una orden de compra completa por ID (con cabecera e items)
 */
export const getOrdenCompraById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Crea una nueva orden de compra (con cabecera e items)
 * @param {object} ordenData (Debe tener { cuotas, proveedor_id_proveedor, items: [...] })
 */
export const createOrdenCompra = async (ordenData) => {
  const response = await axios.post(API_URL, ordenData);
  return response.data;
};