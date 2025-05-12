import axios from 'axios';

// Configuration de l'instance axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si erreur 401 et pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentative de rafraîchissement du token
        await auth.refreshToken();
        // Réessayer la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        await auth.logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Service d'authentification
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

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