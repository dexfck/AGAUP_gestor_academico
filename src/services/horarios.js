import api from './api';

export const getHorarios = async () => {
  const response = await api.get('/api/horarios');
  return response.data;
};

export const createHorario = async (data) => {
  const response = await api.post('/api/horarios', data);
  return response.data;
};

export const updateHorario = async (id, data) => {
  const response = await api.put(`/api/horarios/${id}`, data);
  return response.data;
};

export const deleteHorario = async (id) => {
  const response = await api.delete(`/api/horarios/${id}`);
  return response.data;
};
