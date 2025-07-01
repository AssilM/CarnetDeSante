import express from "express";
import {
  getDisponibilitesByMedecinId,
  createDisponibilite,
  updateDisponibilite,
  deleteDisponibilite,
  getCreneauxDisponibles,
} from "../controllers/disponibilite.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes publiques
// GET /api/disponibilites/medecin/:medecinId - Récupérer toutes les disponibilités d'un médecin
router.get("/medecin/:medecinId", getDisponibilitesByMedecinId);

// GET /api/disponibilites/medecin/:medecinId/creneaux - Récupérer les créneaux disponibles pour un médecin
router.get("/medecin/:medecinId/creneaux", getCreneauxDisponibles);

// Routes protégées
router.use(authenticate);

// POST /api/disponibilites - Créer une nouvelle disponibilité
router.post("/", authorize(["medecin", "admin"]), createDisponibilite);

// PUT /api/disponibilites/:id - Mettre à jour une disponibilité
router.put("/:id", authorize(["medecin", "admin"]), updateDisponibilite);

// DELETE /api/disponibilites/:id - Supprimer une disponibilité
router.delete("/:id", authorize(["medecin", "admin"]), deleteDisponibilite);

export default router;
