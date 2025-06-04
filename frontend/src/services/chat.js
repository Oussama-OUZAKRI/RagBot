import api from './api';

export const sendMessage = async (message, documentIds = [], conversationId = null) => {
  try {
    const response = await api.post('/chat/message', {
      message,
      document_ids: documentIds,
      conversation_id: conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getConversationHistory = async (conversationId) => {
  try {
    const response = await api.get(`/chat/history/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};