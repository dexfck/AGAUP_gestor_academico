import api from './api';

export const getMaterias = async () => {
  const response = await api.get('/api/materias');
  console.log(response)
  return response.data;
};

export const createMateria = async (data) => {
  try {
    const response = await api.post('/api/materias', data);
    console.log("Respuesta Exitosa:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fallo al crear materia. Error completo:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteMateria = async (id) => {
  const response = await api.delete(`/api/materias/${id}`);
  console.log(response)
  return response.data;
};
