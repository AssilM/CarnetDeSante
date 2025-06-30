import express from "express";
import {
  getAllMedecins,
  getMedecinById,
  getProfile,
  createOrUpdateProfile,
  searchMedecins,
  getMedecinIdByUserId,
  getAllSpecialites,
  getMedecinsBySpecialite,
} from "../controllers/medecin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes publiques
// (aucune pour les médecins)

// Routes protégées
router.use(authenticate);

// Routes pour les médecins
// GET /api/medecins/profile - Récupérer le profil du médecin connecté
router.get("/profile", authorize("medecin"), getProfile);

// POST /api/medecins/profile - Créer ou mettre à jour le profil du médecin
router.post("/profile", authorize("medecin"), createOrUpdateProfile);

// Routes pour tous les utilisateurs authentifiés
// GET /api/medecins - Récupérer tous les médecins
router.get("/", getAllMedecins);

// GET /api/medecins/search - Rechercher des médecins
router.get("/search", searchMedecins);

// GET /api/medecins/specialites - Récupérer toutes les spécialités
router.get("/specialites", getAllSpecialites);

// GET /api/medecins/specialite/:specialite - Récupérer les médecins par spécialité
router.get("/specialite/:specialite", getMedecinsBySpecialite);

// Route spéciale pour récupérer l'ID médecin à partir de l'ID utilisateur
router.get("/utilisateur/:userId", getMedecinIdByUserId);

// GET /api/medecins/:id - Récupérer un médecin par son ID (qui est maintenant l'ID utilisateur)
router.get("/:id", getMedecinById);

export default router;
