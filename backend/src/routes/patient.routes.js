import express from "express";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getMedicalInfo,
  getProfile,
  createOrUpdateProfile,
} from "../controllers/patient.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes publiques
// (aucune pour les patients)

// Routes protégées
router.use(authenticate);

// Routes pour les patients
// GET /api/patients/medical-info - Récupérer les informations médicales du patient connecté
router.get("/medical-info", authorize("patient"), getMedicalInfo);

// GET /api/patients/profile - Récupérer le profil du patient connecté
router.get("/profile", authorize("patient"), getProfile);

// POST /api/patients/profile - Créer ou mettre à jour le profil du patient
router.post("/profile", authorize("patient"), createOrUpdateProfile);

// Routes pour les médecins et les administrateurs
// GET /api/patients - Récupérer tous les patients
router.get("/", authorize(["medecin", "admin"]), getAllPatients);

// GET /api/patients/search - Rechercher des patients
router.get("/search", authorize(["medecin", "admin"]), searchPatients);

// GET /api/patients/:id - Récupérer un patient par son ID (qui est maintenant l'ID utilisateur)
router.get("/:id", authorize(["medecin", "admin", "patient"]), getPatientById);

// POST /api/patients - Créer un nouveau profil patient
router.post("/", authorize("admin"), createPatient);

// PUT /api/patients/:id - Mettre à jour un patient
router.put("/:id", authorize(["admin", "patient"]), updatePatient);

// DELETE /api/patients/:id - Supprimer un patient
router.delete("/:id", authorize("admin"), deletePatient);

export default router;
