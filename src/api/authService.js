import axios from 'axios';

const API_URL = 'http://localhost:4000/api/auth';

/**
 * Llama al endpoint de login del backend.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} { user, token }
 */
export const login = async (email, password) => {
  // Esta es la "comunicación"
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password
  });
  
  // Devuelve los datos (user y token)
  return response.data;
};

// (Opcional) Puedes añadir la función de registro aquí también
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};