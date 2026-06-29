import api from './api';

export const getContactos = async () => {
  const response = await api.get('/api/contactos');
  return response.data;
};

export const createContacto = async (data) => {
  const response = await api.post('/api/contactos', data);
  return response.data;
};

export const updateContacto = async (id, data) => {
  const response = await api.put(`/api/contactos/${id}`, data);
  return response.data;
};

export const deleteContacto = async (id) => {
  const response = await api.delete(`/api/contactos/${id}`);
  return response.data;
};
