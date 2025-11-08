import axios from 'axios';

const API_URL = 'http://localhost:4000/api/incidentes';

/**
 * Obtiene la lista de todos los incidentes
 */
export const getIncidentes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Crea un nuevo incidente (R7)
 * (El backend asignará el 'usuario_id_usuario' desde el token)
 */
export const createIncidente = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

/**
 * Asigna un técnico a un incidente (R7)
 */
export const asignarTecnico = async (incidenteId, tecnicoId) => {
  const response = await axios.post(`${API_URL}/${incidenteId}/asignar`, {
    tecnico_id_tecnico: tecnicoId
  });
  return response.data;
};

/**
 * Resuelve un incidente (R7)
 */
export const resolverIncidente = async (incidenteId, descripcion) => {
  const response = await axios.post(`${API_URL}/${incidenteId}/resolver`, {
    descripcion: descripcion
  });
  return response.data;
};