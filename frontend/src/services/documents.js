import api from './api';

export const docs = {
  getAll: async () => {
    const response = await api.get('/documents');
    return response;
  },

  get: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response;
  },

  updateVisibility: async (id, visibility) => {
    const response = await api.patch(`/documents/${id}/visibility`, { visibility });
    return response;
  },

  download: async (id) => {
    const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
    return response;
  },

  upload: async (formData) => {
    // Create a new FormData with the correct structure
    const request = new FormData();
    
    // Get files from the original formData
    const files = formData.getAll('file');
    const metadata = JSON.parse(formData.get('metadata'));

    // Add each file to the request
    files.forEach(file => {
      request.append('files', file);
    });

    // Add metadata as a JSON string
    request.append('metadata', JSON.stringify(metadata));

    const response = await api.post('/documents', request, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  updateMetadata: async (id, metadata) => {
    const response = await api.patch(`/documents/${id}/metadata`, metadata);
    return response;
  },
};
