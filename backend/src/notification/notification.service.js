import notificationRepository from "./notification.repository.js";

// Types de notifications disponibles
export const NOTIFICATION_TYPES = {
  RENDEZ_VOUS_CREER: "rendez_vous_creer",
  RENDEZ_VOUS_CONFIRME: "rendez_vous_confirme",
  RENDEZ_VOUS_ANNULE: "rendez_vous_annule",
  RENDEZ_VOUS_TERMINE: "rendez_vous_termine",
  DOCUMENT_MEDECIN_UPLOAD: "document_medecin_upload",
  DOCUMENT_PATIENT_SHARED: "document_patient_shared",
  DOCUMENT_ACCESS_REVOKED: "document_access_revoked",
  DOCUMENT_DELETED: "document_deleted",
  NEW_MESSAGE: "new_message",
  SYSTEM_INFO: "system_info",
  SYSTEM_WARNING: "system_warning",
  SYSTEM_ERROR: "system_error",
};

// Créer une nouvelle notification
export const createNotificationService = async (
  userId,
  type,
  titre,
  contenu
) => {
  try {
    // Validation des données
    if (!userId || !type || !titre || !contenu) {
      const error = new Error("Tous les champs sont requis");
      error.code = "MISSING_DATA";
      throw error;
    }

    // Validation du type de notification
    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      const error = new Error("Type de notification invalide");
      error.code = "INVALID_TYPE";
      throw error;
    }

    const notificationData = {
      utilisateur_id: userId,
      type,
      titre,
      contenu,
    };

    const notification = await notificationRepository.createNotification(
      notificationData
    );
    return notification;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
};

// Récupérer toutes les notifications d'un utilisateur
export const getNotificationsByUserService = async (
  userId,
  limit = 50,
  offset = 0
) => {
  try {
    if (!userId) {
      const error = new Error("ID utilisateur requis");
      error.code = "MISSING_USER_ID";
      throw error;
    }

    const notifications = await notificationRepository.getNotificationsByUser(
      userId,
      limit,
      offset
    );
    return notifications;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    throw error;
  }
};

// Récupérer les notifications non lues d'un utilisateur
export const getUnreadNotificationsByUserService = async (userId) => {
  try {
    if (!userId) {
      const error = new Error("ID utilisateur requis");
      error.code = "MISSING_USER_ID";
      throw error;
    }

    const notifications =
      await notificationRepository.getUnreadNotificationsByUser(userId);
    return notifications;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des notifications non lues:",
      error
    );
    throw error;
  }
};

// Compter les notifications non lues d'un utilisateur
export const countUnreadNotificationsByUserService = async (userId) => {
  try {
    if (!userId) {
      const error = new Error("ID utilisateur requis");
      error.code = "MISSING_USER_ID";
      throw error;
    }

    const count = await notificationRepository.countUnreadNotificationsByUser(
      userId
    );
    return count;
  } catch (error) {
    console.error("Erreur lors du comptage des notifications non lues:", error);
    throw error;
  }
};

// Marquer une notification comme lue
export const markNotificationAsReadService = async (notificationId, userId) => {
  try {
    if (!notificationId || !userId) {
      const error = new Error("ID de notification et ID utilisateur requis");
      error.code = "MISSING_DATA";
      throw error;
    }

    const notification = await notificationRepository.markNotificationAsRead(
      notificationId,
      userId
    );

    if (!notification) {
      const error = new Error("Notification non trouvée ou accès non autorisé");
      error.code = "NOT_FOUND";
      throw error;
    }

    return notification;
  } catch (error) {
    console.error(
      "Erreur lors du marquage de la notification comme lue:",
      error
    );
    throw error;
  }
};

// Marquer toutes les notifications d'un utilisateur comme lues
export const markAllNotificationsAsReadService = async (userId) => {
  try {
    if (!userId) {
      const error = new Error("ID utilisateur requis");
      error.code = "MISSING_USER_ID";
      throw error;
    }

    const notifications =
      await notificationRepository.markAllNotificationsAsRead(userId);
    return notifications;
  } catch (error) {
    console.error(
      "Erreur lors du marquage de toutes les notifications comme lues:",
      error
    );
    throw error;
  }
};

// Supprimer une notification
export const deleteNotificationService = async (notificationId, userId) => {
  try {
    if (!notificationId || !userId) {
      const error = new Error("ID de notification et ID utilisateur requis");
      error.code = "MISSING_DATA";
      throw error;
    }

    const notification = await notificationRepository.deleteNotification(
      notificationId,
      userId
    );

    if (!notification) {
      const error = new Error("Notification non trouvée ou accès non autorisé");
      error.code = "NOT_FOUND";
      throw error;
    }

    return notification;
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    throw error;
  }
};

// Supprimer toutes les notifications lues d'un utilisateur
export const deleteReadNotificationsService = async (userId) => {
  try {
    if (!userId) {
      const error = new Error("ID utilisateur requis");
      error.code = "MISSING_USER_ID";
      throw error;
    }

    const notifications = await notificationRepository.deleteReadNotifications(
      userId
    );
    return notifications;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des notifications lues:",
      error
    );
    throw error;
  }
};

// Récupérer une notification par ID
export const getNotificationByIdService = async (notificationId, userId) => {
  try {
    if (!notificationId || !userId) {
      const error = new Error("ID de notification et ID utilisateur requis");
      error.code = "MISSING_DATA";
      throw error;
    }

    const notification = await notificationRepository.getNotificationById(
      notificationId,
      userId
    );

    if (!notification) {
      const error = new Error("Notification non trouvée ou accès non autorisé");
      error.code = "NOT_FOUND";
      throw error;
    }

    return notification;
  } catch (error) {
    console.error("Erreur lors de la récupération de la notification:", error);
    throw error;
  }
};

// Récupérer les notifications par type
export const getNotificationsByTypeService = async (
  userId,
  type,
  limit = 20
) => {
  try {
    if (!userId || !type) {
      const error = new Error("ID utilisateur et type requis");
      error.code = "MISSING_DATA";
      throw error;
    }

    // Validation du type de notification
    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      const error = new Error("Type de notification invalide");
      error.code = "INVALID_TYPE";
      throw error;
    }

    const notifications = await notificationRepository.getNotificationsByType(
      userId,
      type,
      limit
    );
    return notifications;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des notifications par type:",
      error
    );
    throw error;
  }
};

// Nettoyer les anciennes notifications
export const cleanupOldNotificationsService = async (daysOld = 30) => {
  try {
    const deletedNotifications =
      await notificationRepository.deleteOldNotifications(daysOld);
    return {
      deletedCount: deletedNotifications.length,
      deletedNotifications,
    };
  } catch (error) {
    console.error(
      "Erreur lors du nettoyage des anciennes notifications:",
      error
    );
    throw error;
  }
};
