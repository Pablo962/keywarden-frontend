// src/api/calificacionesService.js
import axios from 'axios';

const API_URL_TECNICOS = 'http://localhost:4000/api/calificaciones/tecnicos';
const API_URL_PROVEEDORES = 'http://localhost:4000/api/calificaciones/proveedores';

// ============================================
// CALIFICACIONES DE TÉCNICOS
// ============================================

/**
 * Crea una calificación para un técnico
 */
export const createCalificacionTecnico = async (data) => {
  const response = await axios.post(API_URL_TECNICOS, data);
  return response.data;
};

/**
 * Obtiene todas las calificaciones de técnicos
 */
export const getAllCalificacionesTecnicos = async () => {
  const response = await axios.get(API_URL_TECNICOS);
  return response.data;
};

/**
 * Obtiene el resumen de calificaciones de todos los técnicos
 */
export const getResumenTecnicos = async () => {
  const response = await axios.get(`${API_URL_TECNICOS}/resumen`);
  return response.data;
};

/**
 * Obtiene las calificaciones de un técnico específico
 */
export const getCalificacionesPorTecnico = async (tecnicoId) => {
  const response = await axios.get(`${API_URL_TECNICOS}/tecnico/${tecnicoId}`);
  return response.data;
};

// ============================================
// CALIFICACIONES DE PROVEEDORES
// ============================================

/**
 * Crea una calificación para un proveedor
 */
export const createCalificacionProveedor = async (data) => {
  const response = await axios.post(API_URL_PROVEEDORES, data);
  return response.data;
};

/**
 * Obtiene todas las calificaciones de proveedores
 */
export const getAllCalificacionesProveedores = async () => {
  const response = await axios.get(API_URL_PROVEEDORES);
  return response.data;
};

/**
 * Obtiene el resumen de calificaciones de todos los proveedores
 */
export const getResumenProveedores = async () => {
  const response = await axios.get(`${API_URL_PROVEEDORES}/resumen`);
  return response.data;
};

/**
 * Obtiene las calificaciones de un proveedor específico
 */
export const getCalificacionesPorProveedor = async (proveedorId) => {
  const response = await axios.get(`${API_URL_PROVEEDORES}/proveedor/${proveedorId}`);
  return response.data;
};
