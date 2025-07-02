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
  addDocument,
  getPatientDocuments,
  getDocument,
  deleteDocument,
  downloadDocument,
} from "../controllers/patient.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";
import {
  restrictPatientToSelf,
  checkDocumentOwnership,
} from "../middlewares/ownership.middleware.js";

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
router.get(
  "/:id",
  authorize(["medecin", "admin", "patient"]),
  restrictPatientToSelf("id"),
  getPatientById
);

// POST /api/patients - Créer un nouveau profil patient
router.post("/", authorize("admin"), createPatient);

// PUT /api/patients/:id - Mettre à jour un patient
router.put(
  "/:id",
  authorize(["admin", "patient"]),
  restrictPatientToSelf("id"),
  updatePatient
);

// DELETE /api/patients/:id - Supprimer un patient
router.delete("/:id", authorize("admin"), deletePatient);

// ==================== ROUTES POUR LES DOCUMENTS ====================

// Middleware de log pour debug
router.use("/documents", (req, res, next) => {
  console.log(`📄 Route document: ${req.method} ${req.originalUrl}`);
  console.log("📄 Body:", req.body);
  console.log("📄 User:", { id: req.userId, role: req.userRole });
  next();
});

// POST /api/patient/documents - Ajouter un document (patients et médecins)
router.post(
  "/documents",
  authorize(["patient", "medecin"]),
  uploadDocument,
  addDocument
);

// GET /api/patient/:patient_id/documents - Récupérer les documents d'un patient
router.get(
  "/:patient_id/documents",
  authorize(["patient", "medecin", "admin"]),
  restrictPatientToSelf("patient_id"),
  getPatientDocuments
);

// GET /api/patient/documents/:document_id - Récupérer un document spécifique
router.get(
  "/documents/:document_id",
  authorize(["patient", "medecin", "admin"]),
  checkDocumentOwnership,
  getDocument
);

// GET /api/patient/documents/:document_id/download - Télécharger un fichier de document
router.get(
  "/documents/:document_id/download",
  authorize(["patient", "medecin", "admin"]),
  checkDocumentOwnership,
  downloadDocument
);

// DELETE /api/patient/documents/:document_id - Supprimer un document (médecin créateur ou admin)
router.delete(
  "/documents/:document_id",
  authorize(["medecin", "admin"]),
  deleteDocument
);

export default router;
