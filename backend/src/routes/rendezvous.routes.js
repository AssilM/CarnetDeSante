import express from "express";
import {
  getAllRendezVous,
  getRendezVousById,
  getRendezVousByPatientId,
  getRendezVousByMedecinId,
  createRendezVous,
  updateRendezVous,
  cancelRendezVous,
  deleteRendezVous,
} from "../controllers/rendezvous.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes protégées
router.use(authenticate);

// Routes pour tous les utilisateurs authentifiés
// GET /api/rendez-vous/:id - Récupérer un rendez-vous par son ID
router.get("/:id", getRendezVousById);

// GET /api/rendez-vous/patient/:patientId - Récupérer les rendez-vous d'un patient
router.get("/patient/:patientId", getRendezVousByPatientId);

// GET /api/rendez-vous/medecin/:medecinId - Récupérer les rendez-vous d'un médecin
router.get("/medecin/:medecinId", getRendezVousByMedecinId);

// POST /api/rendez-vous - Créer un nouveau rendez-vous
router.post("/", createRendezVous);

// PUT /api/rendez-vous/:id - Mettre à jour un rendez-vous
router.put("/:id", updateRendezVous);

// PUT /api/rendez-vous/:id/annuler - Annuler un rendez-vous
router.put("/:id/annuler", cancelRendezVous);

// Routes pour les administrateurs
// GET /api/rendez-vous - Récupérer tous les rendez-vous
router.get("/", authorize("admin"), getAllRendezVous);

// DELETE /api/rendez-vous/:id - Supprimer un rendez-vous
router.delete("/:id", authorize("admin"), deleteRendezVous);

export default router;
