/**
 * Configuration des OTP
 * Centralise tous les paramètres liés aux OTP
 */

export const otpConfig = {
  // Durée d'expiration des OTP (en minutes)
  expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,

  // Nombre maximum de tentatives par OTP
  maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 5,

  // Rate limiting - Tentatives OTP
  rateLimitWindow: parseInt(process.env.OTP_RATE_LIMIT_WINDOW) || 15, // minutes
  rateLimitMaxAttempts: parseInt(process.env.OTP_RATE_LIMIT_MAX_ATTEMPTS) || 5,

  // Rate limiting - Demandes OTP
  requestRateLimitWindow: 1, // minute
  requestRateLimitMaxRequests:
    parseInt(process.env.OTP_REQUEST_RATE_LIMIT) || 3,

  // Types de tokens supportés
  tokenTypes: {
    EMAIL_VERIFY: "EMAIL_VERIFY",
    OTP_LOGIN: "OTP_LOGIN",
    PWD_RESET: "PWD_RESET",
  },
};

/**
 * Validation de la configuration OTP
 */
export const validateOTPConfig = () => {
  const requiredEnvVars = [
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
    "JWT_EMAIL_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn("⚠️ Variables d'environnement OTP manquantes:", missingVars);
    console.warn(
      "💡 Assurez-vous de configurer ces variables pour la production"
    );
  } else {
    console.log("✅ Configuration OTP complète");
  }
};
