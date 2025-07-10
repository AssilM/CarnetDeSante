import pool from "../config/db.js";

/**
 * Service de validation des entités
 * Déplacé depuis les faux middlewares entity.middleware.js
 */

/**
 * Vérifie si un patient existe dans la base de données
 * @param {number} patientId - ID du patient à vérifier
 * @returns {Promise<boolean>} - True si le patient existe
 */
export const validatePatientExists = async (patientId) => {
  try {
    console.log("[ValidationService] Vérification du patient:", patientId);

    if (!patientId) {
      return false;
    }

    const patientQuery = `SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1`;
    const patientResult = await pool.query(patientQuery, [patientId]);

    console.log(
      "[ValidationService] Patient trouvé:",
      patientResult.rows.length > 0
    );
    return patientResult.rows.length > 0;
  } catch (error) {
    console.error(
      "[ValidationService] Erreur lors de la vérification du patient:",
      error
    );
    throw new Error("Erreur lors de la vérification du patient");
  }
};

/**
 * Vérifie si un médecin existe dans la base de données
 * @param {number} medecinId - ID du médecin à vérifier
 * @returns {Promise<boolean>} - True si le médecin existe
 */
export const validateDoctorExists = async (medecinId) => {
  try {
    console.log("[ValidationService] Vérification du médecin:", medecinId);

    if (!medecinId) {
      return false;
    }

    const medecinQuery = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
    const medecinResult = await pool.query(medecinQuery, [medecinId]);

    console.log(
      "[ValidationService] Médecin trouvé:",
      medecinResult.rows.length > 0
    );
    return medecinResult.rows.length > 0;
  } catch (error) {
    console.error(
      "[ValidationService] Erreur lors de la vérification du médecin:",
      error
    );
    throw new Error("Erreur lors de la vérification du médecin");
  }
};

/**
 * Vérifie que les entités patient et médecin existent
 * @param {number} patientId - ID du patient
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<{patientExists: boolean, doctorExists: boolean}>}
 */
export const validateEntitiesExistence = async (patientId, medecinId) => {
  try {
    console.log(
      "[ValidationService] Validation des entités - Patient:",
      patientId,
      "Médecin:",
      medecinId
    );

    const [patientExists, doctorExists] = await Promise.all([
      patientId ? validatePatientExists(patientId) : true,
      medecinId ? validateDoctorExists(medecinId) : true,
    ]);

    return { patientExists, doctorExists };
  } catch (error) {
    console.error(
      "[ValidationService] Erreur lors de la validation des entités:",
      error
    );
    throw error;
  }
};
