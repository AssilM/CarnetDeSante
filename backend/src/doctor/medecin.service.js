import pool from "../config/db.js";
import {
  findAllMedecins,
  findMedecinByUserId,
  existsMedecin,
  createMedecin as createMedecinRepo,
  updateMedecin as updateMedecinRepo,
} from "./medecin.repository.js";

/**
 * Service de gestion des médecins
 * Centralise toute la logique métier liée aux médecins
 */

/**
 * Récupère tous les médecins
 * @returns {Promise<Array>} Liste des médecins
 */
export const getAllMedecinsService = async () => {
  return await findAllMedecins();
};

/**
 * Récupère un médecin par son ID utilisateur avec informations complètes
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Médecin avec infos utilisateur ou null
 * @throws {Error} Si erreur lors de la récupération
 */
export const getMedecinByIdService = async (userId) => {
  const query = `
    SELECT m.utilisateur_id, m.specialite, m.description, 
           u.nom, u.prenom, u.email, u.tel_indicatif, u.tel_numero, u.date_naissance, u.sexe,
           u.adresse, u.code_postal, u.ville
    FROM medecin m
    INNER JOIN utilisateur u ON m.utilisateur_id = u.id
    WHERE m.utilisateur_id = $1
  `;

  const result = await pool.query(query, [userId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Récupère le profil du médecin connecté
 * @param {string|number} userId - ID de l'utilisateur connecté
 * @returns {Promise<Object|null>} Profil médecin ou null
 */
export const getProfileService = async (userId) => {
  return await findMedecinByUserId(userId);
};

/**
 * Crée ou met à jour le profil d'un médecin avec validation d'autorisation
 * @param {Object} profileData - Données du profil
 * @param {number} requesterId - ID de l'utilisateur qui fait la demande
 * @param {string} requesterRole - Rôle de l'utilisateur qui fait la demande
 * @returns {Promise<Object>} Profil médecin mis à jour
 * @throws {Error} Si autorisation refusée ou erreur
 */
export const createOrUpdateProfileService = async (
  profileData,
  requesterId,
  requesterRole
) => {
  const { utilisateur_id, specialite, description } = profileData;

  // Validation métier : vérifier les autorisations
  if (requesterId !== parseInt(utilisateur_id) && requesterRole !== "admin") {
    throw new Error("Vous n'êtes pas autorisé à modifier ce profil");
  }

  // Logique métier : création ou mise à jour conditionnelle
  const medecinExists = await existsMedecin(utilisateur_id);
  if (!medecinExists) {
    await createMedecinRepo(utilisateur_id, specialite, description);
  } else {
    await updateMedecinRepo(utilisateur_id, specialite, description);
  }

  // Récupérer le profil mis à jour
  const medecin = await findMedecinByUserId(utilisateur_id);
  if (!medecin) {
    throw new Error("Erreur lors de la création/mise à jour du profil");
  }

  return medecin;
};

/**
 * Recherche des médecins par spécialité, nom ou prénom
 * @param {string} searchTerm - Terme de recherche
 * @returns {Promise<Array>} Liste des médecins trouvés
 * @throws {Error} Si terme de recherche manquant
 */
export const searchMedecinsService = async (searchTerm) => {
  // Validation métier : paramètre requis
  if (!searchTerm || searchTerm.trim() === "") {
    throw new Error("Paramètre de recherche requis");
  }

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

/**
 * Récupère l'ID médecin à partir de l'ID utilisateur
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Objet avec l'ID médecin ou null
 */
export const getMedecinIdByUserIdService = async (userId) => {
  const query = `SELECT utilisateur_id FROM medecin WHERE utilisateur_id = $1`;
  const result = await pool.query(query, [userId]);

  return result.rows.length > 0 ? { id: result.rows[0].utilisateur_id } : null;
};

/**
 * Récupère les médecins par spécialité
 * @param {string} specialite - Spécialité recherchée
 * @returns {Promise<Object>} Objet avec la liste des médecins
 */
export const getMedecinsBySpecialiteService = async (specialite) => {
  const query = `
    SELECT m.utilisateur_id as id, m.specialite, m.description, u.nom, u.prenom, u.email, u.ville,
           u.adresse, u.code_postal, CONCAT(u.tel_indicatif, u.tel_numero) as tel, u.chemin_photo
    FROM medecin m
    INNER JOIN utilisateur u ON m.utilisateur_id = u.id
    WHERE LOWER(m.specialite) = LOWER($1)
  `;

  const result = await pool.query(query, [specialite]);
  return { medecins: result.rows };
};

/**
 * Récupère toutes les spécialités disponibles
 * @returns {Promise<Array>} Liste des spécialités
 */
export const getAllSpecialitesService = async () => {
  const query = `SELECT DISTINCT specialite FROM medecin ORDER BY specialite`;
  const result = await pool.query(query);

  return result.rows.map((row) => row.specialite);
};
