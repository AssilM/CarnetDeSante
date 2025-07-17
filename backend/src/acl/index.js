import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { getFollowedDoctors, getFollowedPatients } from "./acl.controller.js";

const router = express.Router();

// Toutes les routes ACL nécessitent l'authentification
router.use(authenticate);

// Routes réservées au patient
// (Supprimer l'import et la route followPatient)
router.get("/followed-doctors", authorize("patient"), getFollowedDoctors);

// Routes réservées au médecin
router.get("/followed-patients", authorize("medecin"), getFollowedPatients);

export default router;
