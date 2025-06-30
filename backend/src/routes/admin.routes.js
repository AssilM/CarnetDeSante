import express from "express";
import {
  getAllAdministrateurs,
  getAdministrateurById,
  getAdminIdByUserId,
  updateAdministrateur,
  deleteAdministrateur,
  getDashboardStats,
  getSystemStatus,
  manageUsers,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification et des droits d'administrateur
router.use(authenticate);
router.use(authorize("admin"));

// Routes administrateurs
router.get("/", getAllAdministrateurs);
router.get("/:id", getAdministrateurById);
router.get("/user/:userId", getAdminIdByUserId);
router.put("/:id", updateAdministrateur);
router.delete("/:id", deleteAdministrateur);

// Routes pour le tableau de bord administrateur
router.get("/dashboard", getDashboardStats);
router.get("/system", getSystemStatus);
router.post("/users", manageUsers);

export default router;
