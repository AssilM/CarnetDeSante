import express from "express";
import {
  getAllAdministrateurs,
  getAdministrateurById,
  getAdminIdByUserId,
  updateAdministrateur,
  deleteAdministrateur,
} from "../controllers/admin.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes protégées par authentification et rôle admin
router.use(verifyToken, isAdmin);

// Routes administrateurs
router.get("/", getAllAdministrateurs);
router.get("/:id", getAdministrateurById);
router.get("/user/:userId", getAdminIdByUserId);
router.put("/:id", updateAdministrateur);
router.delete("/:id", deleteAdministrateur);

export default router;
