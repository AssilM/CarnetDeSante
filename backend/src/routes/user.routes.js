import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  getUsersByRole,
} from "../controllers/user.controller.js";
import {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes protégées par authentification
router.use(verifyToken);

// Routes accessibles à tous les utilisateurs authentifiés (mais limitées à leur propre profil ou aux admins)
router.get("/:id", isOwnerOrAdmin, getUserById);
router.put("/:id", isOwnerOrAdmin, updateUser);
router.put("/:id/password", isOwnerOrAdmin, updatePassword);

// Routes accessibles uniquement aux administrateurs
router.get("/", isAdmin, getAllUsers);
router.get("/role/:role", isAdmin, getUsersByRole);
router.delete("/:id", isAdmin, deleteUser);

export default router;
