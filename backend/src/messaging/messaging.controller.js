import messagingService from "./messaging.service.js";
import { createNotificationService } from "../notification/notification.service.js";
import pool from "../config/db.js";

// Obtenir toutes les conversations d'un utilisateur
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.userRole;
    
    console.log("🔍 [MESSAGING] getUserConversations appelé:");
    console.log("  - userId:", userId);
    console.log("  - role:", role);
    
    const conversations = await messagingService.getUserConversations(userId, role);
    
    console.log("  - conversations retournées:", conversations.length);
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error("❌ [MESSAGING] Erreur lors de la récupération des conversations:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des conversations"
    });
  }
};

// Obtenir les messages d'une conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    
    console.log(`🔍 [MESSAGING] getConversationMessages appelé:`);
    console.log(`  - conversationId: ${conversationId}`);
    console.log(`  - userId: ${userId}`);
    
    // Vérifier l'accès à la conversation
    const canAccess = await messagingService.canAccessConversation(conversationId, userId);
    console.log(`  - canAccess: ${canAccess}`);
    
    if (!canAccess) {
      console.log(`❌ [MESSAGING] Accès refusé à la conversation ${conversationId}`);
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à cette conversation"
      });
    }
    
    const messages = await messagingService.getConversationMessages(conversationId);
    console.log(`  - messages trouvés: ${messages.length}`);
    console.log(`  - messages:`, messages);
    
    // Marquer les messages comme lus
    await messagingService.markMessagesAsRead(conversationId, userId);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("❌ [MESSAGING] Erreur lors de la récupération des messages:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des messages"
    });
  }
};

// Envoyer un message
export const sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;
    const userId = req.userId;
    
    // Vérifier l'accès à la conversation
    const canAccess = await messagingService.canAccessConversation(conversationId, userId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à cette conversation"
      });
    }
    
    // Envoyer le message
    const message = await messagingService.sendMessage(conversationId, userId, content, type);
    
    // Obtenir les informations du destinataire pour la notification
    const recipient = await messagingService.getMessageRecipient(conversationId, userId);
    
    // Récupérer les informations de l'utilisateur pour la notification
    const userQuery = "SELECT nom, prenom FROM utilisateur WHERE id = $1";
    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];
    const senderName = user ? `${user.prenom} ${user.nom}` : 'Utilisateur';

    // Créer une notification pour le destinataire
    await createNotificationService({
      user_id: recipient.recipient_id,
      type: 'new_message',
      title: 'Nouveau message',
      message: `Nouveau message de ${senderName}`,
      data: {
        conversationId,
        senderId: userId,
        senderName: senderName
      }
    });
    
    res.json({
      success: true,
      data: message
    });
  }

// Créer une conversation pour un rendez-vous
export const createConversationForRendezVous = async (req, res) => {
  try {
    const { rendezVousId } = req.params;
    const { patientId, medecinId } = req.body;
    
    // Vérifier que l'utilisateur a le droit de créer cette conversation
    const userId = req.userId;
    const role = req.userRole;
    if (role === 'patient' && userId !== patientId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }
    if (role === 'medecin' && userId !== medecinId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }
    
    const conversation = await messagingService.createConversation(rendezVousId, patientId, medecinId);
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la conversation"
    });
  }
};

// Obtenir une conversation par rendez-vous
export const getConversationByRendezVous = async (req, res) => {
  try {
    const { rendezVousId } = req.params;
    const userId = req.userId;
    
    const conversation = await messagingService.getConversationByRendezVous(rendezVousId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation non trouvée"
      });
    }
    
    // Vérifier l'accès à la conversation
    if (conversation.patient_id !== userId && conversation.medecin_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à cette conversation"
      });
    }
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la conversation"
    });
  }
};

// Obtenir le nombre de messages non lus
export const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await messagingService.getUnreadMessagesCount(userId);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error("Erreur lors du comptage des messages non lus:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du comptage des messages non lus"
    });
  }
}; 