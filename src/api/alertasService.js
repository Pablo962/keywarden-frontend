import axios from 'axios';

const API_URL = 'http://localhost:4000/api/alertas';

/**
 * Obtiene la lista de cuotas próximas a vencer (R5).
 * Acepta un query param opcional de 'dias'.
 * @param {number} dias - El rango de días para buscar (ej. 7, 30).
 */
export const getAlertasDeVencimiento = async (dias = 7) => {
  const response = await axios.get(`${API_URL}/vencimientos`, {
    params: { dias }
  });
  return response.data;
};

/**
 * Obtiene la lista de garantías próximas a vencer (R2 - NUEVO).
 * @param {number} dias - El rango de días para buscar (default: 30).
 */
export const getAlertasDeGarantias = async (dias = 30) => {
  const response = await axios.get(`${API_URL}/garantias`, {
    params: { dias }
  });
  return response.data;
};