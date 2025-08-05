/**
 * Service API pour la messagerie
 * Gère toutes les interactions avec l'API de messagerie
 */

const createMessagingService = (httpClient) => {
  return {
    // === CONVERSATIONS ===

    // Récupérer toutes les conversations de l'utilisateur
    async getConversations() {
      const response = await httpClient.get("/messaging/conversations");
      return response.data;
    },

    // Créer une nouvelle conversation
    async createConversation(otherUserId) {
      const response = await httpClient.post("/messaging/conversations", {
        otherUserId,
      });
      return response.data;
    },

    // Récupérer une conversation spécifique
    async getConversationById(conversationId) {
      const response = await httpClient.get(
        `/messaging/conversations/${conversationId}`
      );
      return response.data;
    },

    // === MESSAGES ===

    // Récupérer les messages d'une conversation
    async getConversationMessages(conversationId, limit = 50, offset = 0) {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      const response = await httpClient.get(
        `/messaging/conversations/${conversationId}/messages?${params.toString()}`
      );
      return response.data;
    },

    // Envoyer un message
    async sendMessage(conversationId, content) {
      const response = await httpClient.post(
        `/messaging/conversations/${conversationId}/messages`,
        { content }
      );
      return response.data;
    },

    // Marquer les messages comme lus
    async markMessagesAsRead(conversationId) {
      const response = await httpClient.post(
        `/messaging/conversations/${conversationId}/read`
      );
      return response.data;
    },

    // === RECHERCHE UTILISATEURS ===

    // Récupérer les utilisateurs disponibles pour créer une conversation
    async getAvailableUsers() {
      const response = await httpClient.get("/messaging/available-users");
      return response.data;
    },

    // Rechercher des utilisateurs pour créer une conversation
    async searchUsersForConversation(searchTerm = "") {
      const response = await httpClient.get(
        `/messaging/search-users?searchTerm=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    },

    // === STATISTIQUES ===

    // Récupérer le nombre de messages non lus
    async getUnreadCount() {
      const response = await httpClient.get("/messaging/unread-count");
      return response.data;
    },

    // === VALIDATION ===

    // Valider l'accès à une conversation
    async validateConversationAccess(conversationId) {
      const response = await httpClient.get(
        `/messaging/conversations/${conversationId}/validate`
      );
      return response.data;
    },

    // Valider une relation utilisateur
    async validateUserRelationship(otherUserId) {
      const response = await httpClient.get(
        `/messaging/validate-relationship/${otherUserId}`
      );
      return response.data;
    },
  };
};

export default createMessagingService;
