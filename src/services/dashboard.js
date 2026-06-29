import api from './api';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/dashboard');
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return null;
  }
};
