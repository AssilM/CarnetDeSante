import crypto from "crypto";
import pool from "../config/db.js";
import { otpConfig } from "../config/otp.config.js";

/**
 * Génère un code OTP aléatoire à 6 chiffres
 * @returns {string} Code OTP à 6 chiffres
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash un token avec SHA256
 * @param {string} token - Token en clair
 * @returns {string} Hash du token
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Crée un token OTP pour un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} purpose - Type de token ('OTP_LOGIN', 'EMAIL_VERIFY')
 * @param {string} token - Token en clair
 * @param {number} expiryMinutes - Durée d'expiration en minutes (défaut: 10)
 * @returns {Promise<Object>} Informations sur la création
 */
export const createToken = async (
  userId,
  purpose,
  token,
  expiryMinutes = 10
) => {
  try {
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Supprimer l'ancien token s'il existe
    await pool.query(
      "DELETE FROM user_tokens WHERE user_id = $1 AND purpose = $2",
      [userId, purpose]
    );

    // Insérer le nouveau token
    const result = await pool.query(
      "INSERT INTO user_tokens (user_id, purpose, token_hash, expires_at, attempts_left) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [userId, purpose, tokenHash, expiresAt, 5]
    );

    console.log(`✅ Token ${purpose} créé pour l'utilisateur ${userId}`);
    return {
      success: true,
      tokenId: result.rows[0].id,
      expiresAt,
    };
  } catch (error) {
    console.error(
      `❌ Erreur lors de la création du token ${purpose}:`,
      error.message
    );
    throw new Error(`Erreur lors de la création du token: ${error.message}`);
  }
};

/**
 * Vérifie et consomme un token OTP
 * @param {number} userId - ID de l'utilisateur
 * @param {string} purpose - Type de token
 * @param {string} token - Token en clair à vérifier
 * @returns {Promise<boolean>} True si le token est valide et a été consommé
 */
export const verifyAndConsumeToken = async (userId, purpose, token) => {
  try {
    const tokenHash = hashToken(token);

    // Vérifier si le token existe et n'est pas expiré
    const result = await pool.query(
      "SELECT id, attempts_left FROM user_tokens WHERE user_id = $1 AND purpose = $2 AND token_hash = $3 AND expires_at > NOW()",
      [userId, purpose, tokenHash]
    );

    if (result.rows.length === 0) {
      console.log(
        `❌ Token ${purpose} invalide ou expiré pour l'utilisateur ${userId}`
      );
      return false;
    }

    const tokenRecord = result.rows[0];

    // Vérifier les tentatives restantes
    if (tokenRecord.attempts_left <= 0) {
      console.log(
        `❌ Plus de tentatives pour le token ${purpose} de l'utilisateur ${userId}`
      );
      // Supprimer le token épuisé
      await pool.query("DELETE FROM user_tokens WHERE id = $1", [
        tokenRecord.id,
      ]);
      return false;
    }

    // Décrémenter les tentatives
    await pool.query(
      "UPDATE user_tokens SET attempts_left = attempts_left - 1 WHERE id = $1",
      [tokenRecord.id]
    );

    // Si c'était la dernière tentative, supprimer le token
    if (tokenRecord.attempts_left <= 1) {
      await pool.query("DELETE FROM user_tokens WHERE id = $1", [
        tokenRecord.id,
      ]);
    }

    console.log(
      `✅ Token ${purpose} vérifié et consommé pour l'utilisateur ${userId}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la vérification du token ${purpose}:`,
      error.message
    );
    throw new Error(
      `Erreur lors de la vérification du token: ${error.message}`
    );
  }
};

/**
 * Vérifie un token sans le consommer (pour affichage)
 * @param {number} userId - ID de l'utilisateur
 * @param {string} purpose - Type de token
 * @param {string} token - Token en clair à vérifier
 * @returns {Promise<boolean>} True si le token est valide
 */
export const verifyToken = async (userId, purpose, token) => {
  try {
    const tokenHash = hashToken(token);

    const result = await pool.query(
      "SELECT id FROM user_tokens WHERE user_id = $1 AND purpose = $2 AND token_hash = $3 AND expires_at > NOW() AND attempts_left > 0",
      [userId, purpose, tokenHash]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la vérification du token ${purpose}:`,
      error.message
    );
    return false;
  }
};

/**
 * Supprime un token spécifique
 * @param {number} userId - ID de l'utilisateur
 * @param {string} purpose - Type de token
 * @returns {Promise<boolean>} True si le token a été supprimé
 */
export const deleteToken = async (userId, purpose) => {
  try {
    const result = await pool.query(
      "DELETE FROM user_tokens WHERE user_id = $1 AND purpose = $2",
      [userId, purpose]
    );

    console.log(`✅ Token ${purpose} supprimé pour l'utilisateur ${userId}`);
    return result.rowCount > 0;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la suppression du token ${purpose}:`,
      error.message
    );
    return false;
  }
};

/**
 * Nettoie les tokens expirés
 * @returns {Promise<number>} Nombre de tokens supprimés
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await pool.query(
      "DELETE FROM user_tokens WHERE expires_at < NOW()"
    );

    console.log(`🧹 ${result.rowCount} tokens expirés supprimés`);
    return result.rowCount;
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des tokens:", error.message);
    return 0;
  }
};

/**
 * Récupère le token actif d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} purpose - Type de token
 * @returns {Promise<Object|null>} Informations sur le token ou null
 */
export const getActiveToken = async (userId, purpose) => {
  try {
    const result = await pool.query(
      "SELECT id, expires_at, attempts_left FROM user_tokens WHERE user_id = $1 AND purpose = $2 AND expires_at > NOW() AND attempts_left > 0",
      [userId, purpose]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération du token ${purpose}:`,
      error.message
    );
    return null;
  }
};
