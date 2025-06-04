import api from './api';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentDocuments = async (limit = 3) => {
  try {
    const response = await api.get(`/documents?limit=${limit}&orderBy=created_at`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    throw error;
  }
};

export const getPopularQueries = async (limit = 3) => {
  try {
    const response = await api.get(`/dashboard/popular-queries?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular queries:', error);
    throw error;
  }
};
