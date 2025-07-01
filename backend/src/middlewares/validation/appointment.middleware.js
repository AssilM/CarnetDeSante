import pool from "../../config/db.js";

/**
 * Middleware pour valider les données de base d'un rendez-vous
 */
export const validateAppointmentData = (req, res, next) => {
  console.log("[validateAppointmentData] Données reçues:", req.body);
  const { patient_id, medecin_id, date, heure } = req.body;

  // Vérifier les champs obligatoires
  if (!patient_id || !medecin_id || !date || !heure) {
    console.log("[validateAppointmentData] Champs manquants:", {
      patient_id: !patient_id,
      medecin_id: !medecin_id,
      date: !date,
      heure: !heure,
    });
    return res.status(400).json({
      message: "Les champs patient_id, medecin_id, date et heure sont requis",
    });
  }

  // Valider le format de la date
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log("[validateAppointmentData] Format de date invalide:", date);
    return res.status(400).json({
      message: "Format de date invalide. Format attendu: YYYY-MM-DD",
    });
  }

  // Valider le format de l'heure
  if (!heure.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
    console.log("[validateAppointmentData] Format d'heure invalide:", heure);
    return res.status(400).json({
      message: "Format d'heure invalide. Format attendu: HH:MM ou HH:MM:SS",
    });
  }

  console.log("[validateAppointmentData] Validation réussie");
  next();
};

/**
 * Middleware pour convertir les types de données pour les rendez-vous
 */
export const convertAppointmentTypes = (req, res, next) => {
  console.log("[convertAppointmentTypes] Données avant conversion:", req.body);

  // Convertir les IDs en nombres
  if (req.body.patient_id) {
    req.body.patient_id = Number(req.body.patient_id);
  }

  if (req.body.medecin_id) {
    req.body.medecin_id = Number(req.body.medecin_id);
  }

  if (req.body.duree) {
    req.body.duree = Number(req.body.duree);
  } else {
    req.body.duree = 30; // Valeur par défaut
  }

  console.log("[convertAppointmentTypes] Données après conversion:", req.body);
  next();
};

/**
 * Middleware pour vérifier les conflits de rendez-vous
 */
export const checkAppointmentConflict = async (req, res, next) => {
  console.log(
    "[checkAppointmentConflict] Vérification des conflits:",
    req.body
  );
  const { medecin_id, date, heure, duree = 30 } = req.body;

  if (!medecin_id || !date || !heure) {
    console.log(
      "[checkAppointmentConflict] Données incomplètes, passage au middleware suivant"
    );
    return next();
  }

  try {
    const conflitQuery = `
      SELECT * FROM rendez_vous
      WHERE medecin_id = $1 AND date = $2 
      AND statut != 'annulé'
      AND (
        (heure <= $3 AND (heure + (duree || ' minutes')::interval) > $3) OR
        (heure < ($3 + ($4 || ' minutes')::interval) AND (heure + (duree || ' minutes')::interval) >= ($3 + ($4 || ' minutes')::interval)) OR
        (heure >= $3 AND (heure + (duree || ' minutes')::interval) <= ($3 + ($4 || ' minutes')::interval))
      )
    `;

    if (req.params.id) {
      // Si on met à jour un rendez-vous existant, exclure ce rendez-vous de la vérification
      console.log(
        "[checkAppointmentConflict] Vérification pour mise à jour du RDV:",
        req.params.id
      );
      const conflitResult = await pool.query(conflitQuery + " AND id <> $5", [
        medecin_id,
        date,
        heure,
        duree,
        req.params.id,
      ]);

      console.log("[checkAppointmentConflict] Résultat de la vérification:", {
        conflits: conflitResult.rows.length,
        rows: conflitResult.rows,
      });

      if (conflitResult.rows.length > 0) {
        return res.status(400).json({ message: "Ce créneau est déjà réservé" });
      }
    } else {
      console.log("[checkAppointmentConflict] Vérification pour nouveau RDV");
      const conflitResult = await pool.query(conflitQuery, [
        medecin_id,
        date,
        heure,
        duree,
      ]);

      console.log("[checkAppointmentConflict] Résultat de la vérification:", {
        conflits: conflitResult.rows.length,
        rows: conflitResult.rows,
      });

      if (conflitResult.rows.length > 0) {
        return res.status(400).json({ message: "Ce créneau est déjà réservé" });
      }
    }

    console.log("[checkAppointmentConflict] Aucun conflit détecté");
    next();
  } catch (error) {
    console.error(
      "[checkAppointmentConflict] Erreur lors de la vérification des conflits:",
      error
    );
    console.error(
      "[checkAppointmentConflict] Message d'erreur:",
      error.message
    );
    console.error("[checkAppointmentConflict] Stack trace:", error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
