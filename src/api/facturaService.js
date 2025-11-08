import axios from 'axios';

const API_URL = 'http://localhost:4000/api/facturas';

/**
 * Obtiene la lista de todas las facturas (solo cabeceras)
 */
export const getFacturas = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Obtiene una factura completa por ID (con cabecera, items y plan de pago)
 */
export const getFacturaById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Crea una nueva factura (y sus cuotas/detalles)
 * @param {object} data (Debe tener { orden_compra_id_orden_compra, items: [...], info_pago: {...} })
 */
export const createFactura = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

/**
 * Marca una cuota como pagada (R5 - NUEVO).
 * @param {number} cuotaId - ID de la cuota (plan_pago)
 * @param {object} dataPago - { metodo_pago, fecha_pago, observaciones }
 */
export const pagarCuota = async (cuotaId, dataPago) => {
  const response = await axios.put(`${API_URL}/cuotas/${cuotaId}/pagar`, dataPago);
  return response.data;
};