import api from './api';

export const chat = {
  async getConversations() {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  async createConversation() {
    const response = await api.post('/chat/conversations');
    return response.data;
  },

  async getConversationHistory(conversationId) {
    const response = await api.get(`/chat/history/${conversationId}`);
    return response.data;
  },

  async sendMessage(message, documentIds = [], conversationId = null, modelSettings = {}) {
    const response = await api.post('/chat/message', {
      message,
      document_ids: documentIds,
      conversation_id: conversationId,
      model_settings: modelSettings
    });
    return response.data;
  }
};