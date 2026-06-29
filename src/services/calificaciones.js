import api from './api';

export const getCalificaciones = async () => {
  const response = await api.get('/api/calificaciones');
  return response.data;
};

export const createCalificacion = async (data) => {
  const response = await api.post('/api/calificaciones', data);
  return response.data;
};

export const updateCalificacion = async (id, data) => {
  const response = await api.put(`/api/calificaciones/${id}`, data);
  return response.data;
};

export const deleteCalificacion = async (id) => {
  const response = await api.delete(`/api/calificaciones/${id}`);
  return response.data;
};
