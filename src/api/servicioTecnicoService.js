import axios from 'axios';

const API_URL = 'http://localhost:4000/api/servicios-tecnicos';

/**
 * Obtiene el servicio técnico asociado a un incidente específico
 */
export const getServicioTecnicoByIncidente = async (incidenteId) => {
  const response = await axios.get(`${API_URL}/incidente/${incidenteId}`);
  return response.data;
};

/**
 * Obtiene todos los servicios técnicos
 */
export const getServiciosTecnicos = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Obtiene un servicio técnico por ID
 */
export const getServicioTecnicoById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};
