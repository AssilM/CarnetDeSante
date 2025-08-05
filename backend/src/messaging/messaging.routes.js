import express from "express";
import {
  createConversation,
  getUserConversations,
  getConversationById,
  sendMessage,
  getConversationMessages,
  getUnreadCount,
  searchUsersForConversation,
  getAvailableUsers,
  validateConversationAccess,
  validateUserRelationship,
  archiveConversation,
  reactivateConversation,
} from "./messaging.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import messagingRepository from "./messaging.repository.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// === ROUTES DE CONVERSATION ===

// Créer une nouvelle conversation
router.post("/conversations", createConversation);

// Récupérer toutes les conversations de l'utilisateur
router.get("/conversations", getUserConversations);

// Récupérer une conversation spécifique
router.get("/conversations/:conversationId", getConversationById);

// Valider l'accès à une conversation
router.get(
  "/conversations/:conversationId/validate",
  validateConversationAccess
);

// Archiver une conversation
router.post("/conversations/:conversationId/archive", archiveConversation);

// Réactiver une conversation
router.post(
  "/conversations/:conversationId/reactivate",
  reactivateConversation
);

// === ROUTES DE MESSAGES ===

// Envoyer un message dans une conversation
router.post("/conversations/:conversationId/messages", sendMessage);

// Récupérer les messages d'une conversation
router.get("/conversations/:conversationId/messages", getConversationMessages);

// Marquer les messages comme lus
router.post("/conversations/:conversationId/read", async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const updatedCount = await messagingRepository.markMessagesAsRead(
      conversationId,
      req.userId
    );
    res.status(200).json({
      success: true,
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
});

// Récupérer le nombre de messages non lus
router.get("/unread-count", getUnreadCount);

// === ROUTES DE RECHERCHE UTILISATEURS ===

// Rechercher des utilisateurs pour créer une conversation
router.get("/search-users", searchUsersForConversation);

// Récupérer tous les utilisateurs disponibles
router.get("/available-users", getAvailableUsers);

// Valider une relation utilisateur
router.get("/validate-relationship/:otherUserId", validateUserRelationship);

export default router;
