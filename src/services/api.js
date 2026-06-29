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
  // Prevent browser caching for API requests
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config.url.includes('/api/auth/login')) {
      console.warn("Token expirado, cerrando sesión automáticamente...");
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.setItem('session_expired', 'true');
      window.location.href = '/'; 
    } else if (error.response && error.response.status === 401 && error.config.url.includes('/api/auth/login')) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Credenciales incorrectas';
        window.dispatchEvent(new CustomEvent('show_error_toast', { detail: msg }));
    } else {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Ocurrió un error inesperado';
      window.dispatchEvent(new CustomEvent('show_error_toast', { detail: msg }));
    }
    return Promise.reject(error);
  }
);

export default api;
