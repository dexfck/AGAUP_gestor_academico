import api from './api';

export const getInscripciones = async () => {
  const response = await api.get('/api/inscripciones');
  return response.data;
};

export const createInscripcion = async (materia_id, cuatrimestre) => {
  const response = await api.post('/api/inscripciones', { materia_id, cuatrimestre });
  return response.data;
};

export const deleteInscripcion = async (id) => {
  const response = await api.delete(`/api/inscripciones/${id}`);
  return response.data;
};
