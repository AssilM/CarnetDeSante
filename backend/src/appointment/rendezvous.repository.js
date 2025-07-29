import pool from "../config/db.js";

// Récupérer tous les rendez-vous avec infos patient et médecin
export const findAllRendezVous = async () => {
  const query = `
    SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
           p_user.nom as patient_nom, p_user.prenom as patient_prenom,
           m_user.nom as medecin_nom, m_user.prenom as medecin_prenom, m.specialite
    FROM rendez_vous rv
    INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
    INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
    INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
    INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
    ORDER BY rv.date DESC, rv.heure DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Récupérer un rendez-vous par ID avec infos patient et médecin
export const findRendezVousById = async (id) => {
  const query = `
    SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
           p_user.nom as patient_nom, p_user.prenom as patient_prenom,
           m_user.nom as medecin_nom, m_user.prenom as medecin_prenom, m.specialite
    FROM rendez_vous rv
    INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
    INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
    INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
    INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
    WHERE rv.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Récupérer les rendez-vous par patient ID
export const findRendezVousByPatientId = async (patientId) => {
  const query = `
    SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse, rv.notes_medecin,
           m_user.nom as medecin_nom, m_user.prenom as medecin_prenom, m.specialite, m_user.chemin_photo as medecin_chemin_photo
    FROM rendez_vous rv
    INNER JOIN medecin m ON rv.medecin_id = m.utilisateur_id
    INNER JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
    WHERE rv.patient_id = $1
    ORDER BY rv.date DESC, rv.heure DESC
  `;
  const result = await pool.query(query, [patientId]);
  return result.rows;
};

// Récupérer les rendez-vous par médecin ID
export const findRendezVousByMedecinId = async (medecinId) => {
  const query = `
    SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse, rv.notes_medecin,
           p_user.nom as patient_nom, p_user.prenom as patient_prenom
    FROM rendez_vous rv
    INNER JOIN patient p ON rv.patient_id = p.utilisateur_id
    INNER JOIN utilisateur p_user ON p.utilisateur_id = p_user.id
    WHERE rv.medecin_id = $1
    ORDER BY rv.date DESC, rv.heure DESC
  `;
  const result = await pool.query(query, [medecinId]);
  return result.rows;
};

// Créer un nouveau rendez-vous
export const createRendezVous = async (
  patientId,
  medecinId,
  date,
  heure,
  duree,
  motif,
  adresse
) => {
  const insertQuery = `
    INSERT INTO rendez_vous (patient_id, medecin_id, date, heure, duree, motif, adresse)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, patient_id, medecin_id, date, heure, duree, statut, motif, adresse
  `;
  const result = await pool.query(insertQuery, [
    patientId,
    medecinId,
    date,
    heure,
    duree,
    motif,
    adresse,
  ]);
  return result.rows[0];
};

// Mettre à jour un rendez-vous
export const updateRendezVous = async (id, updates) => {
  const { date, heure, duree, statut, motif, adresse } = updates;
  const updateQuery = `
    UPDATE rendez_vous
    SET date = COALESCE($1, date),
        heure = COALESCE($2, heure),
        duree = COALESCE($3, duree),
        statut = COALESCE($4, statut),
        motif = COALESCE($5, motif),
        adresse = COALESCE($6, adresse),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING id, patient_id, medecin_id, date, heure, duree, statut, motif, adresse
  `;
  const result = await pool.query(updateQuery, [
    date,
    heure,
    duree,
    statut,
    motif,
    adresse,
    id,
  ]);
  return result.rows[0];
};

// Annuler un rendez-vous (mettre le statut à "annulé")
export const cancelRendezVous = async (id) => {
  const cancelQuery = `
    UPDATE rendez_vous
    SET statut = 'annulé', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, patient_id, medecin_id, date, heure, statut
  `;
  const result = await pool.query(cancelQuery, [id]);
  return result.rows[0];
};

// Supprimer un rendez-vous
export const deleteRendezVous = async (id) => {
  const deleteQuery = `DELETE FROM rendez_vous WHERE id = $1`;
  const result = await pool.query(deleteQuery, [id]);
  return result.rowCount > 0;
};

// Vérifier les conflits de rendez-vous pour un médecin
export const checkRendezVousConflict = async (
  medecinId,
  date,
  heure,
  duree,
  excludeId = null
) => {
  let query = `
    SELECT id, heure, duree
    FROM rendez_vous
    WHERE medecin_id = $1 AND date = $2 AND statut != 'annulé'
  `;
  const params = [medecinId, date];

  if (excludeId) {
    query += ` AND id != $3`;
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Récupère les rendez-vous d'un médecin pour une date précise (hors annulés)
 * @param {number} medecinId
 * @param {string} dateStr - format YYYY-MM-DD
 * @returns {Promise<Array>} liste de rendez-vous (heure, duree)
 */
export const findAppointmentsByMedecinAndDate = async (medecinId, dateStr) => {
  try {
    const result = await pool.query(
      `SELECT heure, duree
       FROM rendez_vous
       WHERE medecin_id = $1
         AND date = $2
         AND statut != 'annulé'
       ORDER BY heure`,
      [medecinId, dateStr]
    );
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur récupération RDV medecin=${medecinId} date=${dateStr}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des rendez-vous");
  }
};

/**
 * Mettre à jour automatiquement le statut d'un ou plusieurs rendez-vous
 * @param {string} status - Le nouveau statut ('en_cours' ou 'terminé')
 * @param {Object} conditions - Les conditions pour la mise à jour
 * @returns {Promise<Object>} Résultat de la requête
 */
export const updateAppointmentStatus = async (status, conditions = {}) => {
  try {
    // Construction dynamique de la requête selon les conditions fournies
    let query = `
      UPDATE rendez_vous
      SET statut = $1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE 1=1
    `;

    const params = [status];
    let paramIndex = 2;

    // Ajouter les conditions dynamiquement si présentes
    if (conditions.id) {
      query += ` AND id = $${paramIndex}`;
      params.push(conditions.id);
      paramIndex++;
    }

    if (conditions.status) {
      query += ` AND statut = $${paramIndex}`;
      params.push(conditions.status);
      paramIndex++;
    }

    // Ajouter la clause RETURNING pour obtenir les lignes affectées
    query += ` RETURNING id, statut, updated_at`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur mise à jour statut=${status}:`,
      error.message
    );
    throw new Error(
      `Erreur lors de la mise à jour du statut des rendez-vous: ${error.message}`
    );
  }
};

/**
 * Met à jour les notes du médecin pour un rendez-vous donné (seulement par le médecin propriétaire)
 * @param {number} appointmentId
 * @param {number} medecinId
 * @param {string} notes
 * @returns {Promise<Object>} Le rendez-vous mis à jour
 */
export const updateNotesMedecin = async (appointmentId, medecinId, notes) => {
  const query = `
    UPDATE rendez_vous
    SET notes_medecin = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND medecin_id = $3
    RETURNING id, notes_medecin, updated_at
  `;
  const result = await pool.query(query, [notes, appointmentId, medecinId]);
  return result.rows[0];
};

/**
 * Met à jour la raison d'annulation pour un rendez-vous donné (seulement par le médecin propriétaire)
 * @param {number} appointmentId
 * @param {number} medecinId
 * @param {string} raison
 * @returns {Promise<Object>} Le rendez-vous mis à jour
 */
export const updateRaisonAnnulation = async (
  appointmentId,
  medecinId,
  raison
) => {
  const query = `
    UPDATE rendez_vous
    SET raison_annulation = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND medecin_id = $3
    RETURNING id, raison_annulation, updated_at
  `;
  const result = await pool.query(query, [raison, appointmentId, medecinId]);
  return result.rows[0];
};

// Créer le lien de suivi patient-médecin si non existant
export const createFollowRelationship = async (patientId, doctorId) => {
  // Vérifie si le lien existe déjà
  const checkQuery = `SELECT 1 FROM patient_doctor WHERE patient_id = $1 AND doctor_id = $2`;
  const checkResult = await pool.query(checkQuery, [patientId, doctorId]);
  if (checkResult.rows.length > 0) {
    // Déjà existant, rien à faire
    return;
  }
  // Sinon, insère le lien
  const insertQuery = `INSERT INTO patient_doctor (patient_id, doctor_id, status) VALUES ($1, $2, 'actif')`;
  await pool.query(insertQuery, [patientId, doctorId]);
};
