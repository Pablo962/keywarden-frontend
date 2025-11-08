import axios from 'axios';

const API_URL = 'http://localhost:4000/api/tecnicos';

/**
 * Obtiene la lista de técnicos, con filtros opcionales
 * @param {object} filtros (ej. { nombre: 'Juan', especialidad: 'Redes' })
 */
export const getTecnicos = async (filtros = {}) => {
  const response = await axios.get(API_URL, { params: filtros });
  return response.data;
};

/**
 * Crea un nuevo técnico
 */
export const createTecnico = async (tecnicoData) => {
  const response = await axios.post(API_URL, tecnicoData);
  return response.data;
};

/**
 * Actualiza un técnico existente
 */
export const updateTecnico = async (id, tecnicoData) => {
  const response = await axios.put(`${API_URL}/${id}`, tecnicoData);
  return response.data;
};

/**
 * Realiza una baja FÍSICA de un técnico
 */
export const deleteTecnico = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};