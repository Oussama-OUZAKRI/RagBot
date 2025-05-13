import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Fonctions d'authentification
export const login = async (credentials) => {
  try {
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const { access_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    
    return access_token;
  } catch (error) {
    // Gérer les erreurs de connexion ici si nécessaire
    throw error;
  }
};

export const logout = async () => {
  localStorage.removeItem('access_token');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    // Si le token est invalide ou expiré
    if (error.response?.status === 401) {
      await logout();
    }
    else {
      throw error;
    }
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    console.log(response);
    return response.data;
  } catch (error) {
    // Gérer les erreurs d'inscription ici si nécessaire
    throw error;
  }
};

// Vérifie si l'utilisateur est authentifié
export const isAuthenticated = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;

  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
};