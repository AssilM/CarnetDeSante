import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";
import {
  createDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  downloadDocument,
  shareDocument,
  revokeDocument,
  getSharedDocuments,
  createDocumentByPatient,
  createDocumentByDoctor,
  shareDocumentByPatient,
  revokeDocumentByPatient,
  getDocumentsSharedByPatientToDoctor,
  getDocumentDoctorsWithAccess,
  createDocumentByDoctorWithRdv,
  getDocumentsByRendezVous,
  getAllDocumentTypes,
  createVaccinationByPatient,
} from "./document.controller.js";

const router = express.Router();

// Récupérer tous les types de documents
router.get("/types", getAllDocumentTypes);

router.use(authenticate);

// Upload document (patient)
router.post(
  "/",
  authorize(["patient"]),
  uploadDocument,
  createDocumentByPatient
);

// Upload vaccination (patient) - sans fichier
router.post(
  "/vaccination",
  authorize(["patient"]),
  createVaccinationByPatient
);

// Upload document (médecin)
router.post(
  "/doctor",
  authorize(["medecin"]),
  uploadDocument,
  createDocumentByDoctor
);

// Upload document (médecin) lié à un rendez-vous
router.post(
  "/doctor-with-rdv",
  authorize(["medecin"]),
  uploadDocument,
  createDocumentByDoctorWithRdv
);

// Récupérer tous les documents accessibles à l'utilisateur
router.get("/", authorize(["patient", "medecin", "admin"]), getDocuments);

// Récupérer un document spécifique (détail)
router.get("/:id", authorize(["patient", "medecin", "admin"]), getDocument);

// Supprimer un document
router.delete("/:id", authorize(["medecin", "admin"]), deleteDocument);

router.get(
  "/:id/download",
  authorize(["patient", "medecin", "admin"]),
  downloadDocument
);

// Partage d'un document (patient -> médecin)
router.post("/share", authorize("patient"), shareDocumentByPatient);
// Révocation d'un partage (patient -> médecin)
router.post("/revoke", authorize("patient"), revokeDocumentByPatient);
// Liste des documents partagés pour l'utilisateur connecté
router.get("/shared", getSharedDocuments);
// Liste des documents partagés par un patient donné au médecin connecté
router.get(
  "/shared-by-patient/:patientId",
  authorize(["medecin"]),
  getDocumentsSharedByPatientToDoctor
);

// Récupérer tous les documents liés à un rendez-vous
router.get(
  "/by-rendezvous/:rendezVousId",
  authorize(["medecin", "patient", "admin"]),
  getDocumentsByRendezVous
);

// Liste des permissions (médecins ayant accès) pour un document
router.get("/:id/permissions", getDocumentDoctorsWithAccess);

export default router;
