import api from './api';

export const getDocuments = async () => {
  try {
    const response = await api.get('/documents');
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

export const getDocument = async (id) => {
  try {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};
