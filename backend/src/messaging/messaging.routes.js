import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  createConversationForRendezVous,
  getConversationByRendezVous,
  getUnreadMessagesCount
} from "./messaging.controller.js";

const router = express.Router();

// Middleware de debug pour voir les routes
router.use((req, res, next) => {
  console.log(`🔍 [MESSAGING ROUTES] ${req.method} ${req.path}`);
  next();
});

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Obtenir toutes les conversations de l'utilisateur
router.get("/conversations", getUserConversations);

// Obtenir le nombre de messages non lus
router.get("/unread-count", getUnreadMessagesCount);

// Routes spécifiques d'abord (plus spécifiques avant les génériques)
router.get("/conversation/rendez-vous/:rendezVousId", getConversationByRendezVous);
router.post("/conversation/rendez-vous/:rendezVousId", createConversationForRendezVous);

// Routes génériques ensuite
router.get("/conversation/:conversationId/messages", getConversationMessages);
router.post("/conversation/:conversationId/messages", sendMessage);

export default router; 