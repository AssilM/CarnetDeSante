// Export des routes
export { default as notificationRoutes } from "./notification.routes.js";

// Export des services
export {
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

// Export du repository
export { default as notificationRepository } from "./notification.repository.js";

// Export des contrôleurs
export {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  checkNewNotifications,
  getNotification,
  getNotificationsByType,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationTypes,
  cleanupOldNotifications,
} from "./notification.controller.js";
