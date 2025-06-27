import { Router } from "express";
import * as disponibiliteController from "../controllers/disponibilite.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes publiques
router.get(
  "/medecin/:medecinId",
  disponibiliteController.getDisponibilitesForMedecin
);
router.get(
  "/medecin/:medecinId/creneaux",
  disponibiliteController.getCreneauxDisponibles
);

// Routes protégées (nécessitent authentification)
router.post("/", verifyToken, disponibiliteController.addDisponibilite);
router.put("/:id", verifyToken, disponibiliteController.updateDisponibilite);
router.delete("/:id", verifyToken, disponibiliteController.deleteDisponibilite);

export default router;
