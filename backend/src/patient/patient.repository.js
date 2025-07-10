import pool from "../config/db.js";

// Récupérer tous les patients avec leurs infos utilisateur
export const findAllPatients = async () => {
  const query = `
    SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
           u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe
    FROM patient p
    INNER JOIN utilisateur u ON p.utilisateur_id = u.id
    ORDER BY u.nom, u.prenom
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Récupérer un patient par son ID utilisateur avec toutes ses infos
export const findPatientByUserId = async (userId) => {
  const query = `
    SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
           u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
           u.adresse, u.code_postal, u.ville
    FROM patient p
    INNER JOIN utilisateur u ON p.utilisateur_id = u.id
    WHERE p.utilisateur_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Vérifier si un patient existe
export const existsPatient = async (userId) => {
  const checkQuery = `SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1`;
  const result = await pool.query(checkQuery, [userId]);
  return result.rows.length > 0;
};

// Créer un nouveau profil patient
export const createPatient = async (userId, groupeSanguin, taille, poids) => {
  const insertQuery = `
    INSERT INTO patient (utilisateur_id, groupe_sanguin, taille, poids)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(insertQuery, [userId, groupeSanguin, taille, poids]);
};

// Mettre à jour un profil patient
export const updatePatient = async (userId, groupeSanguin, taille, poids) => {
  const updateQuery = `
    UPDATE patient
    SET groupe_sanguin = COALESCE($1, groupe_sanguin),
        taille = COALESCE($2, taille),
        poids = COALESCE($3, poids),
        updated_at = CURRENT_TIMESTAMP
    WHERE utilisateur_id = $4
  `;
  await pool.query(updateQuery, [groupeSanguin, taille, poids, userId]);
};

// Supprimer un patient
export const deletePatient = async (userId) => {
  const deleteQuery = `DELETE FROM patient WHERE utilisateur_id = $1`;
  const result = await pool.query(deleteQuery, [userId]);
  return result.rowCount > 0;
};
