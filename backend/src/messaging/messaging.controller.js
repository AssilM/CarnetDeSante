import {
  createConversationService,
  getUserConversationsService,
  getConversationByIdService,
  sendMessageService,
  getConversationMessagesService,
  getUnreadCountService,
  searchUsersForConversationService,
  getAvailableUsersService,
  validateConversationAccessService,
  validateUserRelationshipService,
  archiveConversationService,
  reactivateConversationService,
} from "./messaging.service.js";

// === CONVERSATIONS ===

export const createConversation = async (req, res, next) => {
  try {
    console.log("🔍 Création de conversation - Body reçu:", req.body);
    console.log("🔍 Création de conversation - UserId:", req.userId);
    console.log("🔍 Création de conversation - UserRole:", req.userRole);

    const { otherUserId } = req.body;

    console.log(
      "🔍 Création de conversation - OtherUserId extrait:",
      otherUserId
    );

    if (!otherUserId) {
      console.log("❌ Création de conversation - OtherUserId manquant");
      return res.status(400).json({
        success: false,
        message: "ID de l'utilisateur requis",
      });
    }

    const conversation = await createConversationService(
      req.userId,
      req.userRole,
      parseInt(otherUserId)
    );

    res.status(201).json({
      success: true,
      conversation,
      message: "Conversation créée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserConversations = async (req, res, next) => {
  try {
    const conversations = await getUserConversationsService(
      req.userId,
      req.userRole
    );

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await getConversationByIdService(
      req.userId,
      req.userRole,
      parseInt(conversationId)
    );

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// === MESSAGES ===

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Contenu du message requis",
      });
    }

    const message = await sendMessageService(
      req.userId,
      req.userRole,
      parseInt(conversationId),
      content
    );

    res.status(201).json({
      success: true,
      message: message,
      notification: {
        type: "success",
        title: "Message envoyé",
        message: "Votre message a été envoyé avec succès",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await getConversationMessagesService(
      req.userId,
      req.userRole,
      parseInt(conversationId),
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await getUnreadCountService(req.userId);

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// === RECHERCHE UTILISATEURS ===

export const searchUsersForConversation = async (req, res, next) => {
  try {
    const { searchTerm = "" } = req.query;

    const users = await searchUsersForConversationService(
      req.userId,
      req.userRole,
      searchTerm
    );

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableUsers = async (req, res, next) => {
  try {
    const users = await getAvailableUsersService(req.userId, req.userRole);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// === VALIDATION ===

export const validateConversationAccess = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const hasAccess = await validateConversationAccessService(
      req.userId,
      req.userRole,
      parseInt(conversationId)
    );

    res.status(200).json({
      success: true,
      hasAccess,
    });
  } catch (error) {
    next(error);
  }
};

export const validateUserRelationship = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;

    const hasRelationship = await validateUserRelationshipService(
      req.userId,
      req.userRole,
      parseInt(otherUserId)
    );

    res.status(200).json({
      success: true,
      hasRelationship,
    });
  } catch (error) {
    next(error);
  }
};

export const archiveConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const archivedConversation = await archiveConversationService(
      req.userId,
      req.userRole,
      parseInt(conversationId)
    );

    res.status(200).json({
      success: true,
      message: "Conversation archivée avec succès",
      conversation: archivedConversation,
    });
  } catch (error) {
    next(error);
  }
};

export const reactivateConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const reactivatedConversation = await reactivateConversationService(
      req.userId,
      req.userRole,
      parseInt(conversationId)
    );

    res.status(200).json({
      success: true,
      message: "Conversation réactivée avec succès",
      conversation: reactivatedConversation,
    });
  } catch (error) {
    next(error);
  }
};
