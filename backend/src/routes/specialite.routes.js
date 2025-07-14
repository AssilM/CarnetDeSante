import express from "express";
import { getAllSpecialitesController } from "../specialite/specialite.controller.js";

const router = express.Router();

// Récupérer toutes les spécialités (public)
router.get("/api/specialites", getAllSpecialitesController);

export default router;
