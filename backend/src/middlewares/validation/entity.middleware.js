import pool from "../../config/db.js";

/**
 * Middleware pour vérifier si un patient existe
 */
export const checkPatientExists = async (req, res, next) => {
  const patient_id = req.body.patient_id || req.params.patientId;
  console.log("[checkPatientExists] Vérification du patient:", patient_id);

  if (!patient_id) {
    console.log(
      "[checkPatientExists] ID patient non fourni, passage au middleware suivant"
    );
    return next();
  }

  try {
    const patientQuery = `SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1`;
    console.log("[checkPatientExists] Exécution de la requête:", patientQuery, [
      patient_id,
    ]);

    const patientResult = await pool.query(patientQuery, [patient_id]);
    console.log("[checkPatientExists] Résultat de la requête:", {
      rows: patientResult.rows,
      count: patientResult.rows.length,
    });

    if (patientResult.rows.length === 0) {
      console.log(
        "[checkPatientExists] Patient non trouvé avec ID:",
        patient_id
      );
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    console.log("[checkPatientExists] Patient trouvé avec ID:", patient_id);
    next();
  } catch (error) {
    console.error(
      "[checkPatientExists] Erreur lors de la vérification du patient:",
      error
    );
    console.error("[checkPatientExists] Message d'erreur:", error.message);
    console.error("[checkPatientExists] Stack trace:", error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Middleware pour vérifier si un médecin existe
 */
export const checkDoctorExists = async (req, res, next) => {
  const medecin_id = req.body.medecin_id || req.params.medecinId;
  console.log("[checkDoctorExists] Vérification du médecin:", medecin_id);

  if (!medecin_id) {
    console.log(
      "[checkDoctorExists] ID médecin non fourni, passage au middleware suivant"
    );
    return next();
  }

  try {
    const medecinQuery = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
    console.log("[checkDoctorExists] Exécution de la requête:", medecinQuery, [
      medecin_id,
    ]);

    const medecinResult = await pool.query(medecinQuery, [medecin_id]);
    console.log("[checkDoctorExists] Résultat de la requête:", {
      rows: medecinResult.rows,
      count: medecinResult.rows.length,
    });

    if (medecinResult.rows.length === 0) {
      console.log(
        "[checkDoctorExists] Médecin non trouvé avec ID:",
        medecin_id
      );
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    console.log("[checkDoctorExists] Médecin trouvé avec ID:", medecin_id);
    next();
  } catch (error) {
    console.error(
      "[checkDoctorExists] Erreur lors de la vérification du médecin:",
      error
    );
    console.error("[checkDoctorExists] Message d'erreur:", error.message);
    console.error("[checkDoctorExists] Stack trace:", error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
