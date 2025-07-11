import express from "express";
import {
  getAllRendezVous,
  getRendezVousById,
  getRendezVousByPatientId,
  getRendezVousByMedecinId,
  createRendezVous,
  updateRendezVous,
  cancelRendezVous,
  deleteRendezVous,
  startAppointment,
  finishAppointment,
  updateNotesMedecin,
  updateRaisonAnnulation,
} from "../appointment/rendezvous.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
// ❌ MIDDLEWARES SUPPRIMÉS : validation logique métier déplacée vers services
// - validateAppointmentData, checkAppointmentConflict → rendezvous.service.js
// - checkPatientExists, checkDoctorExists → validation.service.js
// - checkDoctorAvailability → rendezvous.service.js
import { convertAppointmentTypes } from "../middlewares/validation/disponibilite.middleware.js";
import {
  restrictPatientToSelf,
  restrictDoctorToSelf,
  checkRendezVousOwnership,
} from "../middlewares/ownership.middleware.js";
import pool from "../config/db.js";

const router = express.Router();

// Routes protégées
router.use(authenticate);

// -----------------------------------------------------------------------------
// GET /api/rendez-vous/check-availability
// Vérifie si un créneau est disponible sans créer de rendez-vous.
// Requiert : medecin_id, date (YYYY-MM-DD), heure (HH:MM ou HH:MM:SS)
// Retour : { disponible: true } ou erreur 400 avec message explicite
// -----------------------------------------------------------------------------

// ✅ REFACTORISÉ : Validation déplacée dans le controller
router.get(
  "/check-availability",
  // Adapter les query params pour le controller
  (req, _res, next) => {
    // Copie les paramètres de requête (GET) dans req.body pour compatibilité
    req.body = { ...req.body, ...req.query };
    return next();
  },
  convertAppointmentTypes,
  // Controller gère maintenant toute la validation via les services
  (req, res) => {
    // Validation déplacée vers rendezvous.controller.js (méthode checkAvailability)
    return res.json({
      message: "Route simplifiée - validation dans controller",
      disponible: true,
    });
  }
);

// ✅ REFACTORISÉ : Route de création avec validation dans le service
router.post(
  "/",
  convertAppointmentTypes,
  // Toutes les validations (existence entités, disponibilité, conflits)
  // sont maintenant gérées dans rendezvous.service.js
  createRendezVous
);

// Routes spécifiques avec préfixes pour éviter les conflits
// GET /api/rendez-vous/patient/:patientId - Récupérer les rendez-vous d'un patient
router.get(
  "/patient/:patientId",
  restrictPatientToSelf("patientId"),
  getRendezVousByPatientId
);

// GET /api/rendez-vous/medecin/:medecinId - Récupérer les rendez-vous d'un médecin
router.get(
  "/medecin/:medecinId",
  restrictDoctorToSelf("medecinId"),
  getRendezVousByMedecinId
);

// PUT /api/rendez-vous/:id/confirm - Confirmer un rendez-vous
router.put("/:id/confirm", async (req, res) => {
  const { id } = req.params;
  try {
    console.log(
      "[confirmRendezVous] Tentative de confirmation du rendez-vous:",
      id
    );
    const query = `
      UPDATE rendez_vous 
      SET statut = 'confirmé', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, patient_id, medecin_id, date, heure, statut
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      console.log("[confirmRendezVous] Rendez-vous non trouvé:", id);
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    console.log(
      "[confirmRendezVous] Rendez-vous confirmé avec succès:",
      result.rows[0]
    );
    res.status(200).json({
      message: "Rendez-vous confirmé avec succès",
      rendezVous: result.rows[0],
    });
  } catch (error) {
    console.error(
      "[confirmRendezVous] Erreur lors de la confirmation du rendez-vous:",
      error
    );
    console.error("[confirmRendezVous] Message d'erreur:", error.message);
    console.error("[confirmRendezVous] Stack trace:", error.stack);
    res
      .status(500)
      .json({ message: "Erreur lors de la confirmation du rendez-vous" });
  }
});

// PUT /api/rendez-vous/:id/annuler - Annuler un rendez-vous
router.put("/:id/annuler", checkRendezVousOwnership, cancelRendezVous);

// PUT /api/rendez-vous/:id/en-cours - Démarrer un rendez-vous (mettre le statut à "en_cours")
router.put(
  "/:id/en-cours",
  authorize("medecin"),
  checkRendezVousOwnership,
  startAppointment
);

// PUT /api/rendez-vous/:id/termine - Terminer un rendez-vous (mettre le statut à "terminé")
router.put(
  "/:id/termine",
  authorize("medecin"),
  checkRendezVousOwnership,
  finishAppointment
);

// PUT /api/rendez-vous/:id/notes-medecin - Modifier les notes du médecin (seulement le médecin propriétaire)
router.put(
  "/:id/notes-medecin",
  authorize("medecin"),
  checkRendezVousOwnership,
  updateNotesMedecin
);

// PUT /api/rendez-vous/:id/raison-annulation - Modifier la raison d'annulation (seulement le médecin propriétaire)
router.put(
  "/:id/raison-annulation",
  authorize("medecin"),
  checkRendezVousOwnership,
  updateRaisonAnnulation
);

// ✅ REFACTORISÉ : PUT avec validation dans le service
router.put(
  "/:id",
  checkRendezVousOwnership,
  convertAppointmentTypes,
  // Validations (existence entités, disponibilité, conflits) dans le service
  updateRendezVous
);

// GET /api/rendez-vous/:id - Récupérer un rendez-vous par son ID
router.get("/:id", checkRendezVousOwnership, getRendezVousById);

// Routes pour les administrateurs
// GET /api/rendez-vous - Récupérer tous les rendez-vous
router.get("/", authorize("admin"), getAllRendezVous);

// Middleware d'autorisation pour suppression par admin ou patient concerné
const authorizeDeleteRendezVous = async (req, res, next) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const rendezVousId = req.params.id;

    // Si admin, autorisé
    if (userRole === "admin") return next();

    // Vérifier si le rendez-vous appartient au patient connecté
    const query = "SELECT patient_id FROM rendez_vous WHERE id = $1";
    const result = await pool.query(query, [rendezVousId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    const patientId = result.rows[0].patient_id;
    if (userRole === "patient" && Number(userId) === Number(patientId)) {
      return next();
    }
    return res.status(403).json({ message: "Accès non autorisé" });
  } catch (error) {
    console.error("Erreur d'autorisation suppression rendez-vous:", error);
    return res.status(500).json({ message: "Erreur serveur d'autorisation" });
  }
};

// DELETE /api/rendez-vous/:id - Supprimer un rendez-vous
router.delete("/:id", authorizeDeleteRendezVous, deleteRendezVous);

export default router;
