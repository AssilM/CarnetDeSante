import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../config/db.js";
import { findByEmail } from "./auth.repository.js";
import { createToken, verifyAndConsumeToken } from "../email/token.service.js";

/**
 * Demande de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object>} Informations sur la demande
 */
export const requestPasswordReset = async (email) => {
  console.log("Service: Demande de réinitialisation pour:", email);

  // Vérifier si l'utilisateur existe
  const user = await findByEmail(email);
  if (!user) {
    console.log("Service: Utilisateur non trouvé");
    throw new Error("Email non trouvé");
  }

  // Vérifier si une demande récente existe (rate limiting)
  const recentRequest = await pool.query(
    "SELECT created_at FROM user_tokens WHERE user_id = $1 AND purpose = 'PWD_RESET' AND created_at > NOW() - INTERVAL '5 minutes'",
    [user.id]
  );

  if (recentRequest.rows.length > 0) {
    const retryAfter = Math.ceil(
      (new Date(recentRequest.rows[0].created_at).getTime() +
        5 * 60 * 1000 -
        Date.now()) /
        1000
    );
    throw new Error("Demande trop récente");
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Créer le token en base (expire dans 1 heure)
  await createToken(user.id, "PWD_RESET", resetToken, 60);

  console.log(
    "Service: Token de réinitialisation créé pour l'utilisateur",
    user.id
  );

  return {
    email: user.email,
    resetToken,
  };
};

/**
 * Vérifie un token de réinitialisation
 * @param {string} token - Token de réinitialisation
 * @returns {Promise<boolean>} True si le token est valide
 */
export const verifyPasswordResetToken = async (token) => {
  console.log("Service: Vérification du token de réinitialisation");

  try {
    // Chercher le token en base
    const result = await pool.query(
      "SELECT user_id FROM user_tokens WHERE purpose = 'PWD_RESET' AND token_hash = $1 AND expires_at > NOW() AND attempts_left > 0",
      [crypto.createHash("sha256").update(token).digest("hex")]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Service: Erreur lors de la vérification du token:", error);
    return false;
  }
};

/**
 * Réinitialise le mot de passe avec un token
 * @param {string} token - Token de réinitialisation
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<Object>} Informations sur la réinitialisation
 */
export const resetPassword = async (token, newPassword) => {
  console.log("Service: Réinitialisation du mot de passe");

  // Vérifier la force du mot de passe
  if (newPassword.length < 8) {
    throw new Error("Mot de passe trop faible");
  }

  // Vérifier et consommer le token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const result = await pool.query(
    "SELECT user_id FROM user_tokens WHERE purpose = 'PWD_RESET' AND token_hash = $1 AND expires_at > NOW() AND attempts_left > 0",
    [tokenHash]
  );

  if (result.rows.length === 0) {
    throw new Error("Token invalide ou expiré");
  }

  const userId = result.rows[0].user_id;

  // Hasher le nouveau mot de passe
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Mettre à jour le mot de passe
  await pool.query(
    "UPDATE utilisateur SET password = $1, updated_at = NOW() WHERE id = $2",
    [hashedPassword, userId]
  );

  // Supprimer le token utilisé
  await pool.query(
    "DELETE FROM user_tokens WHERE user_id = $1 AND purpose = 'PWD_RESET'",
    [userId]
  );

  // Invalider tous les refresh tokens de l'utilisateur
  await pool.query("DELETE FROM refresh_token WHERE utilisateur_id = $1", [
    userId,
  ]);

  console.log("Service: Mot de passe réinitialisé pour l'utilisateur", userId);

  return {
    success: true,
    userId,
  };
};

/**
 * Nettoie les tokens de réinitialisation expirés
 * @returns {Promise<number>} Nombre de tokens supprimés
 */
export const cleanupExpiredResetTokens = async () => {
  try {
    const result = await pool.query(
      "DELETE FROM user_tokens WHERE purpose = 'PWD_RESET' AND expires_at < NOW()"
    );

    console.log(
      "🧹 Nettoyage des tokens de réinitialisation expirés:",
      result.rowCount
    );
    return result.rowCount;
  } catch (error) {
    console.error(
      "❌ Erreur lors du nettoyage des tokens de réinitialisation:",
      error
    );
    return 0;
  }
};
