import { Router } from "express";
import * as medecinController from "../controllers/medecin.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes publiques
router.get("/", medecinController.getAllMedecins);
router.get("/specialites", medecinController.getAllSpecialites);
router.get(
  "/specialite/:specialite",
  medecinController.getMedecinsBySpecialite
);
router.get("/:id", medecinController.getMedecinById);
router.get("/utilisateur/:userId", medecinController.getMedecinIdByUserId);

// Routes protégées (nécessitent authentification)
router.post("/", verifyToken, medecinController.createMedecin);
router.put("/:id", verifyToken, medecinController.updateMedecin);
router.delete("/:id", verifyToken, medecinController.deleteMedecin);

export default router;
