import { httpService } from "../http/index.js";

// Récupérer toutes les notifications de l'utilisateur
export const getNotifications = async (limit = 50, offset = 0) => {
  try {
    const response = await httpService.get(
      `/notifications?limit=${limit}&offset=${offset}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    throw error;
  }
};

// Récupérer les notifications non lues
export const getUnreadNotifications = async () => {
  try {
    const response = await httpService.get("/notifications/unread");
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des notifications non lues:",
      error
    );
    throw error;
  }
};

// Compter les notifications non lues
export const getUnreadCount = async () => {
  try {
    const response = await httpService.get("/notifications/count");
    return response.data;
  } catch (error) {
    console.error("Erreur lors du comptage des notifications non lues:", error);
    throw error;
  }
};

// Vérifier s'il y a de nouvelles notifications (pour le polling)
export const checkNewNotifications = async () => {
  try {
    const response = await httpService.get("/notifications/check");
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification des nouvelles notifications:",
      error
    );
    throw error;
  }
};

// Récupérer une notification spécifique
export const getNotification = async (notificationId) => {
  try {
    const response = await httpService.get(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la notification:", error);
    throw error;
  }
};

// Récupérer les notifications par type
export const getNotificationsByType = async (type, limit = 20) => {
  try {
    const response = await httpService.get(
      `/notifications/type/${type}?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des notifications par type:",
      error
    );
    throw error;
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await httpService.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors du marquage de la notification comme lue:",
      error
    );
    throw error;
  }
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await httpService.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors du marquage de toutes les notifications comme lues:",
      error
    );
    throw error;
  }
};

// Supprimer une notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await httpService.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    throw error;
  }
};

// Supprimer toutes les notifications lues
export const deleteReadNotifications = async () => {
  try {
    const response = await httpService.delete("/notifications/read");
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des notifications lues:",
      error
    );
    throw error;
  }
};

// Récupérer les types de notifications disponibles
export const getNotificationTypes = async () => {
  try {
    const response = await httpService.get("/notifications/types");
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types de notifications:",
      error
    );
    throw error;
  }
};

// Créer une notification (médecins et admins seulement)
export const createNotification = async (notificationData) => {
  try {
    const response = await httpService.post("/notifications", notificationData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
};

// Nettoyer les anciennes notifications (admin seulement)
export const cleanupOldNotifications = async (daysOld = 30) => {
  try {
    const response = await httpService.post("/notifications/cleanup", {
      daysOld,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors du nettoyage des anciennes notifications:",
      error
    );
    throw error;
  }
};
