import api from './api';

export const getTareas = async () => {
  const response = await api.get('/api/tareas');
  return response.data;
};

export const createTarea = async (data) => {
  const response = await api.post('/api/tareas', data);
  return response.data;
};

export const updateTarea = async (id, data) => {
  const response = await api.put(`/api/tareas/${id}`, data);
  return response.data;
};

export const deleteTarea = async (id) => {
  const response = await api.delete(`/api/tareas/${id}`);
  return response.data;
};
