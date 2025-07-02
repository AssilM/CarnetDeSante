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
} from "../controllers/rendezvous.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
  validateAppointmentData,
  convertAppointmentTypes,
  checkAppointmentConflict,
} from "../middlewares/validation/appointment.middleware.js";
import {
  checkPatientExists,
  checkDoctorExists,
} from "../middlewares/validation/entity.middleware.js";
import { checkDoctorAvailability } from "../middlewares/validation/availability.middleware.js";
import {
  restrictPatientToSelf,
  restrictDoctorToSelf,
  checkRendezVousOwnership,
} from "../middlewares/ownership.middleware.js";
import pool from "../config/db.js";

const router = express.Router();

// Routes protégées
router.use(authenticate);

// Route simplifiée pour la création de rendez-vous (pour déboguer)
router.post("/", async (req, res) => {
  try {
    console.log("[DEBUG] Requête de création de rendez-vous reçue:", req.body);

    const {
      patient_id,
      medecin_id,
      date,
      heure,
      duree = 30,
      motif,
      adresse,
    } = req.body;

    // Vérification manuelle des champs obligatoires
    if (!patient_id || !medecin_id || !date || !heure) {
      console.log("[DEBUG] Champs obligatoires manquants");
      return res.status(400).json({
        message: "Les champs patient_id, medecin_id, date et heure sont requis",
      });
    }

    // Conversion des types
    const patientId = Number(patient_id);
    const medecinId = Number(medecin_id);
    const dureeValue = Number(duree);

    console.log("[DEBUG] Données après conversion:", {
      patientId,
      medecinId,
      date,
      heure,
      dureeValue,
      motif,
      adresse,
    });

    // Insérer directement dans la base de données
    const insertQuery = `
      INSERT INTO rendez_vous (patient_id, medecin_id, date, heure, duree, motif, adresse)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, patient_id, medecin_id, date, heure, duree, statut, motif, adresse
    `;

    console.log("[DEBUG] Exécution de la requête d'insertion");

    const insertResult = await pool.query(insertQuery, [
      patientId,
      medecinId,
      date,
      heure,
      dureeValue,
      motif || null,
      adresse || null,
    ]);

    console.log("[DEBUG] Rendez-vous créé avec succès:", insertResult.rows[0]);
    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error("[DEBUG] Erreur lors de la création du rendez-vous:", error);
    console.error("[DEBUG] Message d'erreur:", error.message);
    console.error("[DEBUG] Stack trace:", error.stack);

    // Gestion spécifique des erreurs PostgreSQL
    if (error.code) {
      console.error("[DEBUG] Code d'erreur PostgreSQL:", error.code);

      if (error.code === "23503") {
        return res.status(400).json({
          message:
            "Erreur de référence: un des identifiants (patient ou médecin) n'existe pas",
          detail: error.detail,
        });
      }

      if (error.code === "23505") {
        return res.status(400).json({
          message: "Ce rendez-vous existe déjà",
          detail: error.detail,
        });
      }
    }

    res.status(500).json({
      message: "Erreur lors de la création du rendez-vous",
      error: error.message,
    });
  }
});

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

// PUT /api/rendez-vous/:id - Mettre à jour un rendez-vous
router.put(
  "/:id",
  checkRendezVousOwnership,
  convertAppointmentTypes,
  checkPatientExists,
  checkDoctorExists,
  checkDoctorAvailability,
  checkAppointmentConflict,
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
