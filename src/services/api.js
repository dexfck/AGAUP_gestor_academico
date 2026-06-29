import axios from 'axios';

const BASE_URL = 'https://gestion-academica-api-0o8m.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expirado, cerrando sesión automáticamente...");
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/'; 
    } else {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Ocurrió un error inesperado';
      window.dispatchEvent(new CustomEvent('show_error_toast', { detail: msg }));
    }
    return Promise.reject(error);
  }
);

export default api;
