import express from "express";
import {
  getAllAdministrateurs,
  getAdministrateurById,
  updateAdministrateur,
  deleteAdministrateur,
  getDashboardStats,
  // Gestion des utilisateurs côté admin
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUser,
  deleteUser,
  // Gestion des documents côté admin
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentsByType,
} from "../admin/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification et des droits d'administrateur
router.use(authenticate);
router.use(authorize("admin"));

// Routes pour le tableau de bord administrateur
router.get("/dashboard/stats", getDashboardStats);

// Routes de gestion des utilisateurs (côté admin)
router.get("/users", getAllUsers);
router.get("/users/role/:role", getUsersByRole);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Routes de gestion des documents (côté admin)
router.get("/documents", getAllDocuments);
router.get("/documents/type/:typeId", getDocumentsByType);
router.get("/documents/:id", getDocumentById);
router.delete("/documents/:id", deleteDocument);

// Routes administrateurs (doivent être en dernier pour éviter les conflits)
router.get("/", getAllAdministrateurs);
router.get("/:id", getAdministrateurById);
router.put("/:id", updateAdministrateur);
router.delete("/:id", deleteAdministrateur);

export default router;
