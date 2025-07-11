import pool from "../config/db.js";
import {
  findAllRendezVous,
  findRendezVousById,
  findRendezVousByPatientId,
  findRendezVousByMedecinId,
  createRendezVous as createRendezVousRepo,
  updateRendezVous as updateRendezVousRepo,
  cancelRendezVous as cancelRendezVousRepo,
  deleteRendezVous as deleteRendezVousRepo,
  checkRendezVousConflict,
  updateNotesMedecin,
  updateRaisonAnnulation,
} from "./rendezvous.repository.js";
import { getJourSemaine, isDateInFuture } from "../utils/date.utils.js";

/**
 * Service de gestion des rendez-vous
 * Centralise toute la logique métier complexe des rendez-vous
 */

/**
 * Récupère tous les rendez-vous
 * @returns {Promise<Array>} Liste des rendez-vous
 */
export const getAllRendezVousService = async () => {
  return await findAllRendezVous();
};

/**
 * Récupère un rendez-vous par ID avec validation d'autorisation
 * @param {string|number} id - ID du rendez-vous
 * @param {number} requesterId - ID de l'utilisateur qui fait la demande
 * @param {string} requesterRole - Rôle de l'utilisateur
 * @returns {Promise<Object|null>} Rendez-vous ou null
 * @throws {Error} Si autorisation refusée
 */
export const getRendezVousByIdService = async (
  id,
  requesterId,
  requesterRole
) => {
  const rdv = await findRendezVousById(id);
  if (!rdv) {
    return null;
  }

  // Logique d'autorisation métier complexe
  if (requesterRole === "admin") {
    // Admin peut tout voir
    return rdv;
  }

  if (requesterRole === "patient") {
    // Patient doit être propriétaire
    if (Number(requesterId) !== Number(rdv.patient_id)) {
      throw new Error("Accès non autorisé");
    }
    return rdv;
  }

  if (requesterRole === "medecin") {
    // Médecin doit être concerné par le RDV
    if (Number(requesterId) !== Number(rdv.medecin_id)) {
      throw new Error("Accès non autorisé");
    }
    return rdv;
  }

  // Rôle non reconnu
  throw new Error("Accès non autorisé");
};

/**
 * Récupère les rendez-vous d'un patient
 * @param {string|number} patientId - ID du patient
 * @returns {Promise<Array>} Liste des rendez-vous
 */
export const getRendezVousByPatientIdService = async (patientId) => {
  return await findRendezVousByPatientId(patientId);
};

/**
 * Récupère les rendez-vous d'un médecin
 * @param {string|number} medecinId - ID du médecin
 * @returns {Promise<Array>} Liste des rendez-vous
 */
export const getRendezVousByMedecinIdService = async (medecinId) => {
  return await findRendezVousByMedecinId(medecinId);
};

/**
 * Crée un nouveau rendez-vous avec validations métier complexes
 * @param {Object} rdvData - Données du rendez-vous
 * @returns {Promise<Object>} Nouveau rendez-vous créé
 * @throws {Error} Si validation échoue
 */
export const createRendezVousService = async (rdvData) => {
  const { patient_id, medecin_id, date, heure, duree, motif, adresse } =
    rdvData;

  console.log("[createRendezVousService] Données reçues:", rdvData);

  // Validation métier : empêcher RDV dans le passé ou le jour même
  if (!isDateInFuture(date)) {
    throw new Error(
      "Impossible de prendre un rendez-vous pour aujourd'hui ou une date passée."
    );
  }

  // Créer le rendez-vous avec durée par défaut
  const dureeValue = duree || 30;

  try {
    const newRendezVous = await createRendezVousRepo(
      patient_id,
      medecin_id,
      date,
      heure,
      dureeValue,
      motif || null,
      adresse || null
    );

    console.log(
      "[createRendezVousService] Rendez-vous créé avec succès:",
      newRendezVous
    );
    return newRendezVous;
  } catch (error) {
    console.error("[createRendezVousService] Erreur:", error);

    // Logique métier : gestion spécialisée des erreurs SQL
    if (error.code === "23503") {
      console.error("[createRendezVousService] Erreur de clé étrangère:", {
        constraint: error.constraint,
        detail: error.detail,
        table: error.table,
      });
      throw new Error(
        "Erreur de référence: un des identifiants (patient ou médecin) n'existe pas"
      );
    }

    if (error.code === "23505") {
      console.error("[createRendezVousService] Erreur de contrainte unique:", {
        constraint: error.constraint,
        detail: error.detail,
        table: error.table,
      });
      throw new Error("Ce rendez-vous existe déjà");
    }

    throw error; // Réthrow autres erreurs
  }
};

/**
 * Met à jour un rendez-vous avec validations complexes
 * @param {string|number} id - ID du rendez-vous
 * @param {Object} updateData - Nouvelles données
 * @returns {Promise<Object>} Rendez-vous mis à jour
 * @throws {Error} Si validation échoue ou RDV non trouvé
 */
export const updateRendezVousService = async (id, updateData) => {
  const { date, heure, duree, statut, motif, adresse } = updateData;

  // Vérifier si le rendez-vous existe
  const checkQuery = `SELECT patient_id, medecin_id FROM rendez_vous WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    throw new Error("Rendez-vous non trouvé");
  }

  // Validation métier complexe : si date/heure modifiées, vérifier disponibilités
  if (date && heure) {
    const { medecin_id } = checkResult.rows[0];
    await validateMedecinAvailabilityForUpdate(
      medecin_id,
      date,
      heure,
      duree,
      id
    );
  }

  // Logique métier : construction dynamique de la requête UPDATE
  const { query, values } = buildDynamicUpdateQuery(id, updateData);
  const updateResult = await pool.query(query, values);

  return updateResult.rows[0];
};

/**
 * Annule un rendez-vous
 * @param {string|number} id - ID du rendez-vous
 * @returns {Promise<Object|null>} Rendez-vous annulé ou null
 */
export const cancelRendezVousService = async (id) => {
  const cancelledRdv = await cancelRendezVousRepo(id);
  return cancelledRdv;
};

/**
 * Supprime un rendez-vous
 * @param {string|number} id - ID du rendez-vous
 * @returns {Promise<boolean>} Succès de l'opération
 */
export const deleteRendezVousService = async (id) => {
  return await deleteRendezVousRepo(id);
};

/**
 * NOUVEAU : Vérifier disponibilité médecin (remplace checkDoctorAvailability middleware)
 * Déplacé depuis availability.middleware.js
 * @param {string|number} medecinId - ID du médecin
 * @param {string} dateStr - Date du rendez-vous
 * @param {string} heure - Heure du rendez-vous
 * @returns {Promise<{available: boolean, jour: string}>} État de disponibilité
 * @throws {Error} Si erreur système
 */
export const checkDoctorAvailabilityService = async (
  medecinId,
  dateStr,
  heure
) => {
  try {
    console.log(
      "[checkDoctorAvailabilityService] Vérification disponibilité:",
      {
        medecinId,
        dateStr,
        heure,
      }
    );

    if (!medecinId || !dateStr || !heure) {
      throw new Error("Données incomplètes pour vérifier la disponibilité");
    }

    // Extraire le jour de la semaine
    const jourQuery = "SELECT EXTRACT(DOW FROM $1::date) as jour_num";
    const jourResult = await pool.query(jourQuery, [dateStr]);
    const jourNum = jourResult.rows[0].jour_num;

    // Convertir le numéro du jour en nom du jour en français
    const joursSemaine = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];
    const jour = joursSemaine[jourNum];

    console.log("[checkDoctorAvailabilityService] Jour de la semaine:", jour);

    // Vérifier si le médecin a des disponibilités ce jour-là
    const dispoQuery = `
      SELECT * FROM disponibilite_medecin 
      WHERE medecin_id = $1 AND jour = $2 
      AND heure_debut <= $3 AND heure_fin > $3
    `;
    const dispoResult = await pool.query(dispoQuery, [medecinId, jour, heure]);

    const available = dispoResult.rows.length > 0;
    console.log(
      "[checkDoctorAvailabilityService] Médecin disponible:",
      available
    );

    return { available, jour };
  } catch (error) {
    console.error("[checkDoctorAvailabilityService] Erreur:", error);
    throw new Error("Erreur lors de la vérification de la disponibilité");
  }
};

/**
 * NOUVEAU : Vérifier conflits de rendez-vous (remplace checkAppointmentConflict middleware)
 * Déplacé depuis appointment.middleware.js
 * @param {number} medecinId - ID du médecin
 * @param {string} date - Date du RDV
 * @param {string} heure - Heure du RDV
 * @param {number} duree - Durée en minutes (défaut: 30)
 * @param {number|null} excludeRdvId - ID du RDV à exclure (pour updates)
 * @returns {Promise<{hasConflict: boolean, conflictingAppointments: Array}>}
 * @throws {Error} Si erreur système
 */
export const checkAppointmentConflictService = async (
  medecinId,
  date,
  heure,
  duree = 30,
  excludeRdvId = null
) => {
  try {
    console.log("[checkAppointmentConflictService] Vérification conflits:", {
      medecinId,
      date,
      heure,
      duree,
      excludeRdvId,
    });

    if (!medecinId || !date || !heure) {
      throw new Error("Données incomplètes pour vérifier les conflits");
    }

    let conflitQuery = `
      SELECT * FROM rendez_vous
      WHERE medecin_id = $1 AND date = $2 
      AND statut != 'annulé'
      AND (
        (heure <= $3 AND (heure + (duree || ' minutes')::interval) > $3) OR
        (heure < ($3 + ($4 || ' minutes')::interval) AND (heure + (duree || ' minutes')::interval) >= ($3 + ($4 || ' minutes')::interval)) OR
        (heure >= $3 AND (heure + (duree || ' minutes')::interval) <= ($3 + ($4 || ' minutes')::interval))
      )
    `;

    let queryParams = [medecinId, date, heure, duree];

    // Si on met à jour un RDV existant, l'exclure de la vérification
    if (excludeRdvId) {
      conflitQuery += " AND id <> $5";
      queryParams.push(excludeRdvId);
    }

    const conflitResult = await pool.query(conflitQuery, queryParams);

    const hasConflict = conflitResult.rows.length > 0;
    console.log(
      "[checkAppointmentConflictService] Conflit détecté:",
      hasConflict
    );

    return {
      hasConflict,
      conflictingAppointments: conflitResult.rows,
    };
  } catch (error) {
    console.error("[checkAppointmentConflictService] Erreur:", error);
    throw new Error("Erreur lors de la vérification des conflits");
  }
};

/**
 * LEGACY : Vérifier disponibilité médecin alternative (compatibilité)
 * @param {string|number} medecinId - ID du médecin
 * @param {string} dateStr - Date du rendez-vous
 * @param {string} heure - Heure du rendez-vous
 * @returns {Promise<boolean>} True si disponible
 */
export const verifierDisponibiliteMedecinService = async (
  medecinId,
  dateStr,
  heure
) => {
  try {
    console.log("[verifierDisponibiliteMedecinService] Vérification pour:", {
      medecinId,
      dateStr,
      heure,
    });

    // Logique métier : extraire le jour de la semaine avec SQL robuste
    const jourQuery = "SELECT EXTRACT(DOW FROM DATE $1) as jour_num";
    const jourResult = await pool.query(jourQuery, [dateStr]);
    const jourNum = jourResult.rows[0].jour_num;

    // Logique métier : conversion numéro → nom jour
    const joursSemaine = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];
    const jour = joursSemaine[jourNum];

    console.log(
      "[verifierDisponibiliteMedecinService] Jour de la semaine:",
      jour
    );

    // Vérifier disponibilités du médecin
    const dispoQuery = `
      SELECT * FROM disponibilite_medecin 
      WHERE medecin_id = $1 AND jour = $2 
      AND heure_debut <= $3 AND heure_fin > $3
    `;
    const dispoResult = await pool.query(dispoQuery, [medecinId, jour, heure]);

    const disponible = dispoResult.rows.length > 0;
    console.log(
      "[verifierDisponibiliteMedecinService] Médecin disponible:",
      disponible
    );

    return disponible;
  } catch (error) {
    console.error("[verifierDisponibiliteMedecinService] Erreur:", error);
    // Logique métier : en cas d'erreur, supposer disponible pour ne pas bloquer
    return true;
  }
};

/**
 * FONCTION INTERNE : Valider disponibilité médecin pour mise à jour
 * @param {number} medecinId - ID du médecin
 * @param {string} date - Date du RDV
 * @param {string} heure - Heure du RDV
 * @param {number} duree - Durée du RDV
 * @param {number} rdvId - ID du RDV à exclure des conflits
 * @throws {Error} Si indisponible ou conflit
 */
const validateMedecinAvailabilityForUpdate = async (
  medecinId,
  date,
  heure,
  duree,
  rdvId
) => {
  const jour = await getJourSemaine(date);

  // Vérifier disponibilités du médecin ce jour-là
  const dispoQuery = `
    SELECT * FROM disponibilite_medecin 
    WHERE medecin_id = $1 AND jour = $2 
    AND heure_debut <= $3 AND heure_fin > $3
  `;
  const dispoResult = await pool.query(dispoQuery, [medecinId, jour, heure]);

  if (dispoResult.rows.length === 0) {
    throw new Error("Le médecin n'est pas disponible à cette date et heure");
  }

  // Vérifier conflits avec autres RDV
  const dureeValue = duree || 30;
  const conflitQuery = `
    SELECT * FROM rendez_vous
    WHERE medecin_id = $1 AND date = $2 AND id <> $3
    AND statut != 'annulé'
    AND (
      (heure <= $4 AND (heure + (duree || ' minutes')::interval) > $4) OR
      (heure < ($4 + ($5 || ' minutes')::interval) AND (heure + (duree || ' minutes')::interval) >= ($4 + ($5 || ' minutes')::interval)) OR
      (heure >= $4 AND (heure + (duree || ' minutes')::interval) <= ($4 + ($5 || ' minutes')::interval))
    )
  `;
  const conflitResult = await pool.query(conflitQuery, [
    medecinId,
    date,
    rdvId,
    heure,
    dureeValue,
  ]);

  if (conflitResult.rows.length > 0) {
    throw new Error("Ce créneau est déjà réservé");
  }
};

/**
 * FONCTION INTERNE : Construire requête UPDATE dynamique
 * @param {number} id - ID du rendez-vous
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Object} { query, values }
 */
const buildDynamicUpdateQuery = (id, updateData) => {
  const { date, heure, duree, statut, motif, adresse } = updateData;

  let updateQuery = "UPDATE rendez_vous SET ";
  const updateValues = [];
  let paramCounter = 1;

  if (date) {
    updateQuery += `date = $${paramCounter}, `;
    updateValues.push(date);
    paramCounter++;
  }

  if (heure) {
    updateQuery += `heure = $${paramCounter}, `;
    updateValues.push(heure);
    paramCounter++;
  }

  if (duree) {
    updateQuery += `duree = $${paramCounter}, `;
    updateValues.push(duree);
    paramCounter++;
  }

  if (statut) {
    updateQuery += `statut = $${paramCounter}, `;
    updateValues.push(statut);
    paramCounter++;
  }

  if (motif !== undefined) {
    updateQuery += `motif = $${paramCounter}, `;
    updateValues.push(motif);
    paramCounter++;
  }

  if (adresse !== undefined) {
    updateQuery += `adresse = $${paramCounter}, `;
    updateValues.push(adresse);
    paramCounter++;
  }

  updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCounter} RETURNING *`;
  updateValues.push(id);

  return { query: updateQuery, values: updateValues };
};

/**
 * Vérifie et met à jour automatiquement le statut des rendez-vous
 * basé sur la date/heure actuelle et la durée des rendez-vous
 * @returns {Promise<Object>} Résultat avec nombre de mises à jour effectuées
 */
export const checkAppointmentsStatus = async () => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // Format YYYY-MM-DD
    const currentTime = now.toTimeString().split(" ")[0]; // Format HH:MM:SS

    console.log(
      `[SERVICE] Vérification des statuts des rendez-vous à ${currentDate} ${currentTime}`
    );

    // 1. Mettre à jour les rendez-vous qui devraient être en cours
    // Logique: date = aujourd'hui, heure <= maintenant, et (heure + durée) > maintenant
    const enCoursQuery = `
      UPDATE rendez_vous 
      SET statut = 'en_cours', updated_at = CURRENT_TIMESTAMP
      WHERE date = $1 
        AND CAST(heure AS time) <= CAST($2 AS time) 
        AND CAST(heure AS time) + (duree * interval '1 minute') > CAST($2 AS time)
        AND statut = 'confirmé'
      RETURNING id, statut, date, heure, duree
    `;

    const enCoursResult = await pool.query(enCoursQuery, [
      currentDate,
      currentTime,
    ]);

    // 2. Mettre à jour les rendez-vous qui devraient être terminés
    // Logique: soit date < aujourd'hui, soit (date = aujourd'hui et (heure + durée) <= maintenant)
    const termineQuery = `
      UPDATE rendez_vous 
      SET statut = 'terminé', updated_at = CURRENT_TIMESTAMP
      WHERE (
        (date < $1) OR 
        (date = $1 AND CAST(heure AS time) + (duree * interval '1 minute') <= CAST($2 AS time))
      ) 
      AND statut = 'en_cours'
      RETURNING id, statut, date, heure, duree
    `;

    const termineResult = await pool.query(termineQuery, [
      currentDate,
      currentTime,
    ]);

    // Log des mises à jour
    if (enCoursResult.rowCount > 0) {
      console.log(
        `[SERVICE] ${enCoursResult.rowCount} rendez-vous mis en statut 'en_cours'`
      );
      enCoursResult.rows.forEach((rdv) => {
        console.log(
          `[SERVICE] RDV #${rdv.id} mis en statut 'en_cours' (${rdv.date} ${rdv.heure})`
        );
      });
    }

    if (termineResult.rowCount > 0) {
      console.log(
        `[SERVICE] ${termineResult.rowCount} rendez-vous mis en statut 'terminé'`
      );
      termineResult.rows.forEach((rdv) => {
        console.log(
          `[SERVICE] RDV #${rdv.id} mis en statut 'terminé' (${rdv.date} ${rdv.heure})`
        );
      });
    }

    return {
      enCoursUpdated: enCoursResult.rowCount,
      termineUpdated: termineResult.rowCount,
      enCoursAppointments: enCoursResult.rows,
      termineAppointments: termineResult.rows,
    };
  } catch (error) {
    console.error(
      "[SERVICE] Erreur lors de la vérification des statuts de rendez-vous:",
      error
    );
    throw new Error(
      `Erreur lors de la vérification des statuts: ${error.message}`
    );
  }
};

/**
 * Démarre manuellement un rendez-vous (statut -> en_cours)
 * @param {number} id - ID du rendez-vous
 * @returns {Promise<Object>} Rendez-vous mis à jour
 * @throws {Error} Si le rendez-vous n'existe pas ou ne peut pas être démarré
 */
export const startAppointmentService = async (id) => {
  try {
    // Vérifier si le rendez-vous existe et peut être démarré
    const checkQuery = `
      SELECT id, statut, date, heure 
      FROM rendez_vous 
      WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new Error("Rendez-vous non trouvé");
    }

    const appointment = checkResult.rows[0];

    // Vérifier que le statut actuel permet le démarrage
    if (
      appointment.statut !== "confirmé" &&
      appointment.statut !== "planifié"
    ) {
      throw new Error(
        `Impossible de démarrer un rendez-vous avec le statut '${appointment.statut}'`
      );
    }

    // Mettre à jour le statut du rendez-vous
    const updateQuery = `
      UPDATE rendez_vous
      SET statut = 'en_cours', 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, patient_id, medecin_id, date, heure, statut, updated_at
    `;

    const updateResult = await pool.query(updateQuery, [id]);
    console.log(`[SERVICE] Rendez-vous #${id} démarré manuellement`);

    return updateResult.rows[0];
  } catch (error) {
    console.error(
      `[SERVICE] Erreur lors du démarrage du rendez-vous #${id}:`,
      error.message
    );
    throw error;
  }
};

/**
 * Termine manuellement un rendez-vous (statut -> terminé)
 * @param {number} id - ID du rendez-vous
 * @returns {Promise<Object>} Rendez-vous mis à jour
 * @throws {Error} Si le rendez-vous n'existe pas ou ne peut pas être terminé
 */
export const finishAppointmentService = async (id) => {
  try {
    // Vérifier si le rendez-vous existe et peut être terminé
    const checkQuery = `
      SELECT id, statut, date, heure 
      FROM rendez_vous 
      WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new Error("Rendez-vous non trouvé");
    }

    const appointment = checkResult.rows[0];

    // Vérifier que le statut actuel permet la fin
    if (appointment.statut !== "en_cours") {
      throw new Error(
        `Impossible de terminer un rendez-vous avec le statut '${appointment.statut}'`
      );
    }

    // Mettre à jour le statut du rendez-vous
    const updateQuery = `
      UPDATE rendez_vous
      SET statut = 'terminé', 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, patient_id, medecin_id, date, heure, statut, updated_at
    `;

    const updateResult = await pool.query(updateQuery, [id]);
    console.log(`[SERVICE] Rendez-vous #${id} terminé manuellement`);

    return updateResult.rows[0];
  } catch (error) {
    console.error(
      `[SERVICE] Erreur lors de la fin du rendez-vous #${id}:`,
      error.message
    );
    throw error;
  }
};

/**
 * Met à jour les notes du médecin pour un rendez-vous (seulement par le médecin propriétaire)
 * @param {number} appointmentId
 * @param {number} medecinId
 * @param {string} notes
 * @returns {Promise<Object>} Le rendez-vous mis à jour
 */
export const updateNotesMedecinService = async (
  appointmentId,
  medecinId,
  notes
) => {
  // Vérifier que le médecin est bien propriétaire du rendez-vous
  const rdv = await findRendezVousById(appointmentId);
  if (!rdv) throw new Error("Rendez-vous non trouvé");
  if (Number(rdv.medecin_id) !== Number(medecinId)) {
    throw new Error("Accès non autorisé : ce n'est pas votre rendez-vous");
  }
  // Mettre à jour la note
  return await updateNotesMedecin(appointmentId, medecinId, notes);
};

/**
 * Met à jour la raison d'annulation pour un rendez-vous (seulement par le médecin propriétaire)
 * @param {number} appointmentId
 * @param {number} medecinId
 * @param {string} raison
 * @returns {Promise<Object>} Le rendez-vous mis à jour
 */
export const updateRaisonAnnulationService = async (
  appointmentId,
  medecinId,
  raison
) => {
  // Vérifier que le médecin est bien propriétaire du rendez-vous
  const rdv = await findRendezVousById(appointmentId);
  if (!rdv) throw new Error("Rendez-vous non trouvé");
  if (Number(rdv.medecin_id) !== Number(medecinId)) {
    throw new Error("Accès non autorisé : ce n'est pas votre rendez-vous");
  }
  // Mettre à jour la raison
  return await updateRaisonAnnulation(appointmentId, medecinId, raison);
};
