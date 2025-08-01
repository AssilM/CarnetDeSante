/**
 * Middleware de gestion des erreurs OTP
 * Centralise la gestion des erreurs liées aux OTP
 */

/**
 * Middleware pour gérer les erreurs OTP spécifiques
 * @param {Error} error - Erreur capturée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const handleOTPError = (error, req, res, next) => {
  // Erreurs liées aux OTP
  if (error.message === "Code incorrect ou expiré") {
    return res.status(401).json({
      message: "Code OTP incorrect ou expiré",
      code: "OTP_INVALID",
    });
  }

  if (error.message === "Veuillez d'abord vérifier votre adresse email") {
    return res.status(403).json({
      message: "Veuillez d'abord vérifier votre adresse email",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  if (error.message === "Cet email est déjà vérifié") {
    return res.status(400).json({
      message: "Cet email est déjà vérifié",
      code: "EMAIL_ALREADY_VERIFIED",
    });
  }

  // Erreurs de rate limiting (à implémenter)
  if (error.message === "Trop de tentatives OTP") {
    return res.status(429).json({
      message: "Trop de tentatives. Veuillez attendre avant de réessayer.",
      code: "OTP_RATE_LIMIT",
    });
  }

  // Passer à l'erreur suivante si ce n'est pas une erreur OTP
  next(error);
};

/**
 * Middleware pour vérifier le statut de vérification email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const requireEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.validatedData;

    // Cette vérification sera faite dans le service
    // Ce middleware peut être utilisé pour des routes spécifiques
    next();
  } catch (error) {
    next(error);
  }
};
