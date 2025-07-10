import pool from "../config/db.js";

// Récupérer les disponibilités d'un médecin
export const findDisponibilitesByMedecinId = async (medecinId) => {
  const query = `
    SELECT id, medecin_id, jour, heure_debut, heure_fin
    FROM disponibilite_medecin
    WHERE medecin_id = $1
    ORDER BY 
      CASE 
        WHEN jour = 'lundi' THEN 1
        WHEN jour = 'mardi' THEN 2
        WHEN jour = 'mercredi' THEN 3
        WHEN jour = 'jeudi' THEN 4
        WHEN jour = 'vendredi' THEN 5
        WHEN jour = 'samedi' THEN 6
        WHEN jour = 'dimanche' THEN 7
      END,
      heure_debut
  `;
  const result = await pool.query(query, [medecinId]);
  return result.rows;
};

// Vérifier si un médecin existe
export const checkMedecinExists = async (medecinId) => {
  const query = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
  const result = await pool.query(query, [medecinId]);
  return result.rows.length > 0;
};

// Vérifier les chevauchements de disponibilités
export const checkDisponibiliteOverlap = async (
  medecinId,
  jour,
  heureDebut,
  heureFin,
  excludeId = null
) => {
  let query = `
    SELECT id FROM disponibilite_medecin
    WHERE medecin_id = $1 AND jour = $2 
    AND (
      (heure_debut <= $3 AND heure_fin > $3) OR
      (heure_debut < $4 AND heure_fin >= $4) OR
      (heure_debut >= $3 AND heure_fin <= $4)
    )
  `;
  const params = [medecinId, jour, heureDebut, heureFin];

  if (excludeId) {
    query += ` AND id != $5`;
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rows.length > 0;
};

// Créer une nouvelle disponibilité
export const createDisponibilite = async (
  medecinId,
  jour,
  heureDebut,
  heureFin
) => {
  const insertQuery = `
    INSERT INTO disponibilite_medecin (medecin_id, jour, heure_debut, heure_fin)
    VALUES ($1, $2, $3, $4)
    RETURNING id, medecin_id, jour, heure_debut, heure_fin
  `;
  const result = await pool.query(insertQuery, [
    medecinId,
    jour,
    heureDebut,
    heureFin,
  ]);
  return result.rows[0];
};

// Récupérer une disponibilité par ID
export const findDisponibiliteById = async (id) => {
  const query = `SELECT * FROM disponibilite_medecin WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Mettre à jour une disponibilité
export const updateDisponibilite = async (id, jour, heureDebut, heureFin) => {
  const updateQuery = `
    UPDATE disponibilite_medecin
    SET jour = $1, heure_debut = $2, heure_fin = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, medecin_id, jour, heure_debut, heure_fin
  `;
  const result = await pool.query(updateQuery, [
    jour,
    heureDebut,
    heureFin,
    id,
  ]);
  return result.rows[0];
};

// Supprimer une disponibilité
export const deleteDisponibilite = async (id) => {
  const deleteQuery = `DELETE FROM disponibilite_medecin WHERE id = $1`;
  const result = await pool.query(deleteQuery, [id]);
  return result.rowCount > 0;
};

// Récupérer les disponibilités pour un jour donné
export const findDisponibilitesByJour = async (medecinId, jour) => {
  const query = `
    SELECT id, medecin_id, jour, heure_debut, heure_fin
    FROM disponibilite_medecin
    WHERE medecin_id = $1 AND jour = $2
    ORDER BY heure_debut
  `;
  const result = await pool.query(query, [medecinId, jour]);
  return result.rows;
};
