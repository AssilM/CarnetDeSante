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
    SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
           m_user.nom as medecin_nom, m_user.prenom as medecin_prenom, m.specialite
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
    SELECT rv.id, rv.patient_id, rv.medecin_id, rv.date, rv.heure, rv.duree, rv.statut, rv.motif, rv.adresse,
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
