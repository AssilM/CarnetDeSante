import {
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPassword,
} from "./passwordReset.service.js";
import { sendPasswordResetEmail } from "../email/email.service.js";

/**
 * Demande de réinitialisation de mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validatedData;

    console.log("Controller: Demande de réinitialisation pour:", email);

    // Générer le token et l'email
    const result = await requestPasswordReset(email);

    // Envoyer l'email
    await sendPasswordResetEmail(email, result.resetToken);

    res.status(200).json({
      message: "Email de réinitialisation envoyé",
      email: result.email,
    });
  } catch (error) {
    // Gestion des erreurs métier
    if (error.message === "Email non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Demande trop récente") {
      return res.status(429).json({
        message: error.message,
        retryAfter: error.retryAfter,
      });
    }

    // Erreurs techniques
    console.error(
      "Controller: Erreur lors de la demande de réinitialisation:",
      error
    );
    next(error);
  }
};

/**
 * Vérification du token de réinitialisation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.validatedData;

    console.log("Controller: Vérification du token de réinitialisation");

    const isValid = await verifyPasswordResetToken(token);

    if (!isValid) {
      return res.status(400).json({
        message: "Token de réinitialisation invalide ou expiré",
      });
    }

    res.status(200).json({
      message: "Token valide",
      valid: true,
    });
  } catch (error) {
    console.error(
      "Controller: Erreur lors de la vérification du token:",
      error
    );
    next(error);
  }
};

/**
 * Réinitialisation du mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const resetPasswordHandler = async (req, res, next) => {
  try {
    const { token, newPassword } = req.validatedData;

    console.log("Controller: Réinitialisation du mot de passe");

    await resetPassword(token, newPassword);

    res.status(200).json({
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    // Gestion des erreurs métier
    if (error.message === "Token invalide ou expiré") {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "Mot de passe trop faible") {
      return res.status(400).json({ message: error.message });
    }

    // Erreurs techniques
    console.error("Controller: Erreur lors de la réinitialisation:", error);
    next(error);
  }
};
