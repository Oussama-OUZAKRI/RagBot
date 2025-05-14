import axios from 'axios';

// Configuration de l'instance axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,
});
console.log("API base URL:", import.meta.env.VITE_API_BASE_URL);
// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Service des documents
export const documents = {
  upload: (formData, onUploadProgress) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    };
    return api.post('/documents', formData, config);
  },
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
  updateMetadata: (id, metadata) => api.patch(`/documents/${id}/metadata`, metadata),
};

// Service de chat
export const chat = {
  sendMessage: (message, documentIds = []) => 
    api.post('/chat', { message, document_ids: documentIds }),
  getHistory: () => api.get('/chat/history'),
  deleteHistory: () => api.delete('/chat/history'),
};

// Service d'administration
export const admin = {
  getUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemStats: () => api.get('/admin/stats'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
};

export default api;