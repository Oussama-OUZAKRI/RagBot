import api from './api';

export const checkSystemHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking system health:', error);
    return {
      api: false,
      chromadb: false
    };
  }
};
