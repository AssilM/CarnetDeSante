import pool from "../config/db.js";

// Récupérer tous les médecins avec leurs infos utilisateur
export const findAllMedecins = async () => {
  const query = `
    SELECT m.utilisateur_id, m.specialite, m.description, 
           u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero
    FROM medecin m
    INNER JOIN utilisateur u ON m.utilisateur_id = u.id
    ORDER BY u.nom, u.prenom
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Récupérer un médecin par son ID utilisateur
export const findMedecinByUserId = async (userId) => {
  const query = `
    SELECT m.utilisateur_id, m.specialite, m.description, 
           u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
           u.adresse, u.code_postal, u.ville
    FROM medecin m
    INNER JOIN utilisateur u ON m.utilisateur_id = u.id
    WHERE m.utilisateur_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Vérifier si un médecin existe
export const existsMedecin = async (userId) => {
  const checkQuery = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
  const result = await pool.query(checkQuery, [userId]);
  return result.rows.length > 0;
};

// Créer un nouveau profil médecin
export const createMedecin = async (userId, specialite, description) => {
  const insertQuery = `
    INSERT INTO medecin (utilisateur_id, specialite, description)
    VALUES ($1, $2, $3)
  `;
  await pool.query(insertQuery, [userId, specialite, description]);
};

// Mettre à jour un profil médecin
export const updateMedecin = async (userId, specialite, description) => {
  const updateQuery = `
    UPDATE medecin
    SET specialite = $1, description = $2, updated_at = CURRENT_TIMESTAMP
    WHERE utilisateur_id = $3
  `;
  await pool.query(updateQuery, [specialite, description, userId]);
};

// Rechercher des médecins par spécialité, nom ou prénom
export const searchMedecins = async (searchTerm) => {
  const query = `
    SELECT m.utilisateur_id, m.specialite, m.description, 
           u.nom, u.prenom, u.email
    FROM medecin m
    INNER JOIN utilisateur u ON m.utilisateur_id = u.id
    WHERE 
      m.specialite ILIKE $1 OR 
      u.nom ILIKE $1 OR 
      u.prenom ILIKE $1
    ORDER BY u.nom, u.prenom
  `;
  const result = await pool.query(query, [`%${searchTerm}%`]);
  return result.rows;
};

// Récupérer les médecins par spécialité
export const findMedecinsBySpecialite = async (specialite) => {
  const query = `
    SELECT m.utilisateur_id as id, m.specialite, m.description, u.nom, u.prenom, u.email, u.ville,
           u.adresse, u.code_postal, CONCAT(u.tel_indicatif, u.tel_numero) as tel
    FROM medecin m
    INNER JOIN utilisateur u ON m.utilisateur_id = u.id
    WHERE LOWER(m.specialite) = LOWER($1)
    ORDER BY u.nom, u.prenom
  `;
  const result = await pool.query(query, [specialite]);
  return result.rows;
};

// Récupérer toutes les spécialités
export const getAllSpecialites = async () => {
  const query = `
    SELECT DISTINCT specialite 
    FROM medecin 
    WHERE specialite IS NOT NULL AND specialite != ''
    ORDER BY specialite
  `;
  const result = await pool.query(query);
  return result.rows.map((row) => row.specialite);
};
