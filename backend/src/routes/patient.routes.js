import { Router } from "express";
import * as patientController from "../controllers/patient.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes protégées (nécessitent authentification)
router.use(verifyToken);

// Routes pour le profil patient
router.get("/profile", patientController.getProfile); // Profil du patient connecté
router.get("/profile/:userId", patientController.getProfileByUserId); // Profil d'un patient spécifique
router.post("/profile", patientController.createOrUpdateProfile); // Créer ou mettre à jour un profil

// Route pour récupérer les informations médicales du patient connecté
router.get("/medical-info", patientController.getMedicalInfo);

// Routes pour la gestion des patients
router.get("/", patientController.getAllPatients);
router.get("/search", patientController.searchPatients);
router.get("/:id", patientController.getPatientById);
router.get("/utilisateur/:userId", patientController.getPatientIdByUserId);
router.post("/", patientController.createPatient);
router.put("/:id", patientController.updatePatient);
router.delete("/:id", patientController.deletePatient);

export default router;
