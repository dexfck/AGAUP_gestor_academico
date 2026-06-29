import api from './api';

export const getIndiceGeneral = async () => {
  const response = await api.get('/api/indice');
  return response.data;
};

export const getIndiceCuatrimestre = async (cuatrimestre) => {
  const response = await api.get(`/api/indice/${cuatrimestre}`);
  return response.data;
};
