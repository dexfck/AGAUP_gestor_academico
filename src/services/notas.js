import api from './api';

export const getNotas = async () => {
  const response = await api.get('/api/notas');
  return response.data;
};

export const createNota = async (data) => {
  const response = await api.post('/api/notas', data);
  return response.data;
};

export const updateNota = async (id, data) => {
  const response = await api.put(`/api/notas/${id}`, data);
  return response.data;
};

export const deleteNota = async (id) => {
  const response = await api.delete(`/api/notas/${id}`);
  return response.data;
};
