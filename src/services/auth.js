import api from './api';

export const login = async (matricula, password) => {
  const response = await api.post('/api/auth/login', { matricula, password });
  const data = response.data;
  const token = data.token || data.access_token;
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario || {}));
  }
  return data;
};

export const register = async (matricula, nombre, carrera, password) => {
  const response = await api.post('/api/auth/registro', { matricula, nombre, carrera, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};
