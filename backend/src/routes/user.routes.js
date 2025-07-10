import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
  getUsersByRole,
  getMe,
} from "../user/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes accessibles à tous les utilisateurs authentifiés
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.put("/:id/password", updatePassword);

// Routes accessibles uniquement aux administrateurs
router.get("/", authorize("admin"), getAllUsers);
router.get("/role/:role", authorize("admin"), getUsersByRole);
router.delete("/:id", authorize("admin"), deleteUser);

// Routes protégées par authentification
router.get("/me", getMe);

export default router;
