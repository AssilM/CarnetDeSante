import { Router } from "express";
import * as rendezVousController from "../controllers/rendezvous.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes protégées (nécessitent authentification)
router.use(verifyToken);

// Route pour récupérer un rendez-vous spécifique
router.get("/:id", rendezVousController.getRendezVousById);

// Routes pour les patients
router.get("/patient/:patientId", rendezVousController.getRendezVousByPatient);
router.get(
  "/patient/:patientId/upcoming",
  rendezVousController.getUpcomingRendezVousByPatient
);

// Routes pour les médecins
router.get("/medecin/:medecinId", rendezVousController.getRendezVousByMedecin);
router.get(
  "/medecin/:medecinId/upcoming",
  rendezVousController.getUpcomingRendezVousByMedecin
);

// Routes pour la gestion des rendez-vous
router.post("/", rendezVousController.createRendezVous);
router.put("/:id", rendezVousController.updateRendezVous);
router.patch("/:id/cancel", rendezVousController.cancelRendezVous);

export default router;
