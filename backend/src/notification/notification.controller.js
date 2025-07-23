import {
  createNotificationService,
  getNotificationsByUserService,
  getUnreadNotificationsByUserService,
  countUnreadNotificationsByUserService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
  deleteReadNotificationsService,
  getNotificationByIdService,
  getNotificationsByTypeService,
  cleanupOldNotificationsService,
  NOTIFICATION_TYPES,
} from "./notification.service.js";

// GET /api/notifications - Récupérer toutes les notifications de l'utilisateur
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await getNotificationsByUserService(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: notifications.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/unread - Récupérer les notifications non lues
export const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;

    const notifications = await getUnreadNotificationsByUserService(userId);

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/count - Compter les notifications non lues
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.userId;

    const count = await countUnreadNotificationsByUserService(userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/check - Vérifier s'il y a de nouvelles notifications (pour le polling)
export const checkNewNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;

    const count = await countUnreadNotificationsByUserService(userId);

    res.status(200).json({
      success: true,
      hasNewNotifications: count > 0,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/:id - Récupérer une notification spécifique
export const getNotification = async (req, res, next) => {
  try {
    const userId = req.userId;
    const notificationId = parseInt(req.params.id);

    const notification = await getNotificationByIdService(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/type/:type - Récupérer les notifications par type
export const getNotificationsByType = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { type } = req.params;
    const { limit = 20 } = req.query;

    const notifications = await getNotificationsByTypeService(
      userId,
      type,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      notifications,
      type,
      count: notifications.length,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications - Créer une nouvelle notification (pour les tests ou notifications manuelles)
export const createNotification = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { type, titre, contenu, targetUserId } = req.body;

    // Si targetUserId est fourni, l'utilisateur peut créer une notification pour quelqu'un d'autre
    // (utile pour les admins ou médecins)
    const finalUserId = targetUserId || userId;

    const notification = await createNotificationService(
      finalUserId,
      type,
      titre,
      contenu
    );

    res.status(201).json({
      success: true,
      notification,
      message: "Notification créée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read - Marquer une notification comme lue
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.userId;
    const notificationId = parseInt(req.params.id);

    const notification = await markNotificationAsReadService(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      notification,
      message: "Notification marquée comme lue",
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all - Marquer toutes les notifications comme lues
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.userId;

    const notifications = await markAllNotificationsAsReadService(userId);

    res.status(200).json({
      success: true,
      updatedCount: notifications.length,
      message: `${notifications.length} notification(s) marquée(s) comme lue(s)`,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id - Supprimer une notification
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.userId;
    const notificationId = parseInt(req.params.id);

    const notification = await deleteNotificationService(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      deletedNotification: notification,
      message: "Notification supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/read - Supprimer toutes les notifications lues
export const deleteReadNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;

    const notifications = await deleteReadNotificationsService(userId);

    res.status(200).json({
      success: true,
      deletedCount: notifications.length,
      message: `${notifications.length} notification(s) lue(s) supprimée(s)`,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/types - Récupérer les types de notifications disponibles
export const getNotificationTypes = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      types: NOTIFICATION_TYPES,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/cleanup - Nettoyer les anciennes notifications (admin seulement)
export const cleanupOldNotifications = async (req, res, next) => {
  try {
    const { daysOld = 30 } = req.body;

    const result = await cleanupOldNotificationsService(daysOld);

    res.status(200).json({
      success: true,
      ...result,
      message: `${result.deletedCount} ancienne(s) notification(s) supprimée(s)`,
    });
  } catch (error) {
    next(error);
  }
};
