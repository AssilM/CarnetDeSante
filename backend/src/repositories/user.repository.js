import pool from "../config/db.js";

/**
 * Repository pour la gestion des utilisateurs
 * Centralise toutes les opérations de base de données liées aux utilisateurs
 */

/**
 * Recherche un utilisateur par email
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur trouvé ou undefined
 */
export const findByEmail = async (email) => {
  try {
    const {
      rows: [user],
    } = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);
    return user;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche par email:`,
      error.message
    );
    throw new Error("Erreur lors de la recherche de l'utilisateur");
  }
};

/**
 * Insère un nouvel utilisateur (utilisé dans une transaction)
 * @param {Object} client - Client PostgreSQL de la transaction
 * @param {Array} values - Valeurs à insérer
 * @returns {Promise<Object>} L'utilisateur créé
 */
export const insertUser = async (client, values) => {
  try {
    const insertUserText =
      "INSERT INTO utilisateur (email, password, nom, prenom, role, date_naissance, tel_indicatif, tel_numero, sexe, adresse, code_postal, ville) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *";

    const {
      rows: [user],
    } = await client.query(insertUserText, values);
    return user;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de l'insertion d'utilisateur:`,
      error.message
    );
    throw new Error("Erreur lors de la création de l'utilisateur");
  }
};

/**
 * Récupère tous les utilisateurs (sans mot de passe)
 * @returns {Promise<Array>} Liste des utilisateurs
 */
export const findAllUsers = async () => {
  try {
    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur ORDER BY id"
    );
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération des utilisateurs:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
};

/**
 * Récupère un utilisateur par ID (sans mot de passe)
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur trouvé ou undefined
 */
export const findById = async (id) => {
  try {
    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur WHERE id = $1",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche par ID ${id}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

/**
 * Récupère un utilisateur par ID avec mot de passe (pour vérification)
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur trouvé avec mot de passe ou undefined
 */
export const findByIdWithPassword = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM utilisateur WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche avec mot de passe pour ID ${id}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

/**
 * Vérifie si un email est déjà utilisé par un autre utilisateur
 * @param {string} email - Email à vérifier
 * @param {number} excludeId - ID à exclure de la vérification
 * @returns {Promise<boolean>} True si l'email est pris, false sinon
 */
export const isEmailTaken = async (email, excludeId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM utilisateur WHERE email = $1 AND id != $2",
      [email, excludeId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la vérification d'email:`,
      error.message
    );
    throw new Error("Erreur lors de la vérification de l'email");
  }
};

/**
 * Met à jour un utilisateur avec requête dynamique
 * @param {number} userId - ID de l'utilisateur
 * @param {Array<string>} updateFields - Champs à mettre à jour
 * @param {Array} values - Valeurs correspondantes
 * @returns {Promise<Object|undefined>} L'utilisateur mis à jour ou undefined
 */
export const updateUser = async (userId, updateFields, values) => {
  try {
    let query = "UPDATE utilisateur SET ";
    query += updateFields.join(", ");
    query += ` WHERE id = $${
      values.length + 1
    } RETURNING id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville`;
    values.push(userId);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la mise à jour de l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la mise à jour de l'utilisateur");
  }
};

/**
 * Met à jour le mot de passe d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} hashedPassword - Mot de passe haché
 * @returns {Promise<boolean>} True si la mise à jour a réussi
 */
export const updatePassword = async (userId, hashedPassword) => {
  try {
    const result = await pool.query(
      "UPDATE utilisateur SET password = $1 WHERE id = $2 RETURNING id",
      [hashedPassword, userId]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la mise à jour du mot de passe pour l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la mise à jour du mot de passe");
  }
};

/**
 * Supprime un utilisateur
 * @param {number} userId - ID de l'utilisateur à supprimer
 * @returns {Promise<boolean>} True si la suppression a réussi
 */
export const deleteUser = async (userId) => {
  try {
    const result = await pool.query("DELETE FROM utilisateur WHERE id = $1", [
      userId,
    ]);
    console.warn(`[SECURITY] Utilisateur supprimé - ID: ${userId}`);
    return result.rowCount > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la suppression de l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la suppression de l'utilisateur");
  }
};

/**
 * Récupère les utilisateurs par rôle
 * @param {string} role - Rôle des utilisateurs à récupérer
 * @returns {Promise<Array>} Liste des utilisateurs du rôle spécifié
 */
export const findByRole = async (role) => {
  try {
    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur WHERE role = $1 ORDER BY nom, prenom",
      [role]
    );
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche par rôle ${role}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des utilisateurs par rôle");
  }
};

// Ajout de fonctions pour la gestion des refresh-tokens et récupération simplifiée d'utilisateur

/**
 * Stocke un refresh token pour un utilisateur
 * @param {string} token
 * @param {number} userId
 * @returns {Promise<Object>} Refresh token enregistré
 */
export const storeRefreshToken = async (token, userId) => {
  try {
    // Calcul de la date d'expiration (7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const {
      rows: [row],
    } = await pool.query(
      "INSERT INTO refresh_token (token, utilisateur_id, expires_at) VALUES ($1, $2, $3) RETURNING *",
      [token, userId, expiresAt]
    );
    return row;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors du stockage du refresh token:`,
      error.message
    );
    throw new Error("Erreur lors du stockage du refresh token");
  }
};

/**
 * Supprime tous les refresh tokens d'un utilisateur
 * @param {number} userId
 */
export const invalidateAllRefreshTokens = async (userId) => {
  try {
    await pool.query("DELETE FROM refresh_token WHERE utilisateur_id = $1", [
      userId,
    ]);
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de l'invalidation des tokens:`,
      error.message
    );
    throw new Error("Erreur lors de l'invalidation des tokens");
  }
};

/**
 * Cherche un refresh token valide (non expiré)
 * @param {string} token
 * @returns {Promise<Object|undefined>} ligne trouvée ou undefined
 */
export const findRefreshToken = async (token) => {
  try {
    const {
      rows: [row],
    } = await pool.query(
      "SELECT * FROM refresh_token WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    return row;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche du refresh token:`,
      error.message
    );
    throw new Error("Erreur lors de la recherche du refresh token");
  }
};

/**
 * Supprime un refresh token précis
 * @param {string} token
 */
export const deleteRefreshToken = async (token) => {
  try {
    await pool.query("DELETE FROM refresh_token WHERE token = $1", [token]);
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la suppression du refresh token:`,
      error.message
    );
    throw new Error("Erreur lors de la suppression du refresh token");
  }
};

/**
 * Récupère un utilisateur (sans mot de passe) par ID
 * @param {number} id
 * @returns {Promise<Object|undefined>}
 */
export const findByIdLite = async (id) => {
  try {
    const {
      rows: [row],
    } = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur WHERE id = $1",
      [id]
    );
    return row;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche utilisateur lite ${id}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};
