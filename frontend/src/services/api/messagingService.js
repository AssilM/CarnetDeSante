import httpService from '../http/httpService';

const messagingService = {
  // Obtenir toutes les conversations de l'utilisateur
  async getUserConversations() {
    try {
      const response = await httpService.get('/messaging/conversations');
      
      // Le backend retourne { success: true, data: conversations }
      if (response && response.data && response.data.success) {
        return response.data.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  },

  // Obtenir les messages d'une conversation
  async getConversationMessages(conversationId) {
    try {
      const response = await httpService.get(`/messaging/conversation/${conversationId}/messages`);
      
      // Le backend retourne { success: true, data: messages }
      if (response && response.data && response.data.success) {
        return response.data.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  },

  // Envoyer un message
  async sendMessage(conversationId, content) {
      const response = await httpService.post(`/messaging/conversation/${conversationId}/messages`, {
        content
      });
      return response.data;
  },

  // Obtenir le nombre de messages non lus
  async getUnreadCount() {
    try {
      const response = await httpService.get('/messaging/unread-count');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du compteur de messages non lus:', error);
      return 0;
    }
  }
};

export default messagingService; 