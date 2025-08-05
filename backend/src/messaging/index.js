// Export des routes
export { default as messagingRoutes } from "./messaging.routes.js";

// Export des services
export { default as messagingService } from "./messaging.service.js";

// Export des contrôleurs
export {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  createConversationForRendezVous,
  getConversationByRendezVous,
  getUnreadMessagesCount
} from "./messaging.controller.js"; 