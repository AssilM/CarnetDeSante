import express from "express";
import {
  getDisponibilitesByMedecinId,
  createDisponibilite,
  updateDisponibilite,
  deleteDisponibilite,
  getCreneauxDisponibles,
} from "../controllers/disponibilite.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
  checkDoctorBodyOwnership,
  restrictDoctorToSelf,
  checkDisponibiliteOwnership,
} from "../middlewares/ownership.middleware.js";
import {
  validateDisponibilite,
  validateCreneauxParams,
  validateDisponibiliteId,
  validateMedecinId,
} from "../middlewares/validation/disponibilite.middleware.js";
import {
  auditAction,
  rateLimiter,
  detectSuspiciousActivity,
  sanitizeInput,
} from "../middlewares/security.middleware.js";
// ❌ ensureAuthorizedMedecin supprimée - redondante avec ownership.middleware.js

const router = express.Router();

// Middlewares de sécurité globaux pour toutes les routes
router.use(detectSuspiciousActivity);
router.use(sanitizeInput);

// Rate limiting pour les créneaux (plus sollicité)
router.use("/medecin/:medecinId/creneaux", rateLimiter(50, 15 * 60 * 1000)); // 50 requêtes par 15 minutes

// Routes publiques avec validation (accessibles sans authentification)
// GET /api/disponibilites/medecin/:medecinId - Récupérer toutes les disponibilités d'un médecin
// Cette route doit être publique pour que les patients puissent voir les disponibilités
router.get(
  "/medecin/:medecinId",
  validateMedecinId,
  getDisponibilitesByMedecinId
);

// GET /api/disponibilites/medecin/:medecinId/creneaux - Récupérer les créneaux disponibles pour un médecin
// Cette route doit être publique pour la prise de rendez-vous
router.get(
  "/medecin/:medecinId/creneaux",
  validateCreneauxParams,
  getCreneauxDisponibles
);

// Routes protégées (nécessitent une authentification)
router.use(authenticate);

// POST /api/disponibilites - Créer une nouvelle disponibilité
// Seul le médecin lui-même ou un admin peut créer ses disponibilités
router.post(
  "/",
  authorize(["medecin", "admin"]),
  validateDisponibilite,
  checkDoctorBodyOwnership(), // Vérifie que medecin_id dans le body correspond à l'utilisateur
  // ✅ ensureAuthorizedMedecin supprimée - checkDoctorBodyOwnership fait déjà le contrôle
  auditAction("Création de disponibilité", "disponibilite"),
  createDisponibilite
);

// PUT /api/disponibilites/:id - Mettre à jour une disponibilité
router.put(
  "/:id",
  authorize(["medecin", "admin"]),
  validateDisponibiliteId,
  checkDisponibiliteOwnership, // Vérifie que la disponibilité appartient au médecin
  validateDisponibilite,
  auditAction("Modification de disponibilité", "disponibilite"),
  updateDisponibilite
);

// DELETE /api/disponibilites/:id - Supprimer une disponibilité
router.delete(
  "/:id",
  authorize(["medecin", "admin"]),
  validateDisponibiliteId,
  checkDisponibiliteOwnership,
  auditAction("Suppression de disponibilité", "disponibilite"),
  deleteDisponibilite
);

export default router;
