import pool from "../config/db.js";

/**
 * Repository pour la gestion de l'authentification
 * Centralise toutes les opérations de base de données liées à l'authentification
 */

/**
 * Recherche un utilisateur par email (pour authentification)
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur trouvé (avec mot de passe) ou undefined
 */
export const findByEmail = async (email) => {
  try {
    const {
      rows: [user],
    } = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);
    return user;
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors de la recherche par email:`,
      error.message
    );
    throw new Error("Erreur lors de la recherche de l'utilisateur");
  }
};

/**
 * Insère un nouvel utilisateur (utilisé dans une transaction d'inscription)
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
      `[AUTH_REPOSITORY] Erreur lors de l'insertion d'utilisateur:`,
      error.message
    );
    throw new Error("Erreur lors de la création de l'utilisateur");
  }
};

/**
 * Récupère un utilisateur par ID (sans mot de passe, pour les tokens)
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur trouvé ou undefined
 */
export const findByIdLite = async (id) => {
  try {
    const {
      rows: [row],
    } = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville, chemin_photo FROM utilisateur WHERE id = $1",
      [id]
    );
    return row;
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors de la recherche utilisateur lite ${id}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

/**
 * Stocke un refresh token pour un utilisateur
 * @param {string} token - Token de rafraîchissement
 * @param {number} userId - ID de l'utilisateur
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

    console.log(
      `[AUTH_REPOSITORY] Refresh token stocké pour l'utilisateur ${userId}`
    );
    return row;
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors du stockage du refresh token:`,
      error.message
    );
    throw new Error("Erreur lors du stockage du refresh token");
  }
};

/**
 * Supprime tous les refresh tokens d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 */
export const invalidateAllRefreshTokens = async (userId) => {
  try {
    const result = await pool.query(
      "DELETE FROM refresh_token WHERE utilisateur_id = $1",
      [userId]
    );

    console.log(
      `[AUTH_REPOSITORY] ${result.rowCount} refresh tokens invalidés pour l'utilisateur ${userId}`
    );
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors de l'invalidation des tokens:`,
      error.message
    );
    throw new Error("Erreur lors de l'invalidation des tokens");
  }
};

/**
 * Cherche un refresh token valide (non expiré)
 * @param {string} token - Token de rafraîchissement
 * @returns {Promise<Object|undefined>} Token trouvé ou undefined
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
      `[AUTH_REPOSITORY] Erreur lors de la recherche du refresh token:`,
      error.message
    );
    throw new Error("Erreur lors de la recherche du refresh token");
  }
};

/**
 * Supprime un refresh token précis
 * @param {string} token - Token de rafraîchissement à supprimer
 */
export const deleteRefreshToken = async (token) => {
  try {
    const result = await pool.query(
      "DELETE FROM refresh_token WHERE token = $1",
      [token]
    );

    if (result.rowCount > 0) {
      console.log(`[AUTH_REPOSITORY] Refresh token supprimé`);
    }
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors de la suppression du refresh token:`,
      error.message
    );
    throw new Error("Erreur lors de la suppression du refresh token");
  }
};

/**
 * Vérifie si un email est déjà utilisé (pour l'inscription)
 * @param {string} email - Email à vérifier
 * @returns {Promise<boolean>} True si l'email est déjà pris, false sinon
 */
export const isEmailTaken = async (email) => {
  try {
    const result = await pool.query(
      "SELECT id FROM utilisateur WHERE email = $1",
      [email]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors de la vérification d'email:`,
      error.message
    );
    throw new Error("Erreur lors de la vérification de l'email");
  }
};

/**
 * Nettoie les refresh tokens expirés (tâche de maintenance)
 * @returns {Promise<number>} Nombre de tokens supprimés
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await pool.query(
      "DELETE FROM refresh_token WHERE expires_at < NOW()"
    );

    if (result.rowCount > 0) {
      console.log(
        `[AUTH_REPOSITORY] ${result.rowCount} tokens expirés nettoyés`
      );
    }

    return result.rowCount;
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors du nettoyage des tokens expirés:`,
      error.message
    );
    throw new Error("Erreur lors du nettoyage des tokens expirés");
  }
};

/**
 * Compte le nombre de sessions actives pour un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<number>} Nombre de sessions actives
 */
export const countActiveSessions = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM refresh_token WHERE utilisateur_id = $1 AND expires_at > NOW()",
      [userId]
    );

    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error(
      `[AUTH_REPOSITORY] Erreur lors du comptage des sessions:`,
      error.message
    );
    throw new Error("Erreur lors du comptage des sessions");
  }
};
