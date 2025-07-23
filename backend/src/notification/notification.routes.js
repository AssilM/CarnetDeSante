import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
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

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticate);

// Routes publiques (pour tous les utilisateurs authentifiés)
router.get("/", getNotifications);
router.get("/unread", getUnreadNotifications);
router.get("/count", getUnreadCount);
router.get("/check", checkNewNotifications);
router.get("/types", getNotificationTypes);
router.get("/type/:type", getNotificationsByType);
router.get("/:id", getNotification);

// Routes pour marquer comme lu
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

// Routes pour supprimer
router.delete("/:id", deleteNotification);
router.delete("/read", deleteReadNotifications);

// Routes pour créer des notifications (médecins et admins seulement)
router.post("/", authorize(["medecin", "admin"]), createNotification);

// Route de nettoyage (admin seulement)
router.post("/cleanup", authorize(["admin"]), cleanupOldNotifications);

export default router;
