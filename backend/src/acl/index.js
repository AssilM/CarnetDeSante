import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
  shareDocument,
  revokeDocument,
  getSharedDocuments,
  getFollowedDoctors,
  followPatient,
  getFollowedPatients,
} from "./acl.controller.js";

const router = express.Router();

// Toutes les routes ACL nécessitent l'authentification
router.use(authenticate);

// Routes réservées au patient
router.post("/share", authorize("patient"), shareDocument);
router.post("/revoke", authorize("patient"), revokeDocument);
router.get("/followed-doctors", authorize("patient"), getFollowedDoctors);

// Routes réservées au médecin
router.post("/follow-patient", authorize("medecin"), followPatient);
router.get("/followed-patients", authorize("medecin"), getFollowedPatients);

// Route accessible à tout utilisateur authentifié (patient ou médecin)
router.get("/shared", getSharedDocuments);

export default router;
