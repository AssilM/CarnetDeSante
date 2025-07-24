import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";
import {
  createVaccinByPatient,
  getVaccinsByPatient,
  getVaccinById,
  deleteVaccin,
  updateVaccin,
} from "./vaccin.controller.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer un nouveau vaccin (patient)
router.post(
  "/",
  authorize(["patient"]),
  createVaccinByPatient
);

// Créer un nouveau vaccin avec fichier (patient)
router.post(
  "/with-file",
  authorize(["patient"]),
  uploadDocument,
  createVaccinByPatient
);

// Récupérer tous les vaccins du patient connecté
router.get(
  "/",
  authorize(["patient"]),
  getVaccinsByPatient
);

// Récupérer un vaccin par son ID
router.get(
  "/:id",
  authorize(["patient", "medecin", "admin"]),
  getVaccinById
);

// Mettre à jour un vaccin
router.put(
  "/:id",
  authorize(["patient", "medecin", "admin"]),
  updateVaccin
);

// Supprimer un vaccin
router.delete(
  "/:id",
  authorize(["patient", "medecin", "admin"]),
  deleteVaccin
);

export default router;
