import axios from 'axios';

const API_URL = 'http://localhost:4000/api/dashboard';

/**
 * Llama al endpoint del Dashboard (R10)
 * @returns {Promise<object>} El objeto completo de KPIs
 */
export const getReporteEjecutivo = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};