import { z } from "zod";

/**
 * Middleware de validation pour l'authentification
 * Déplacé depuis auth.controller.js pour respecter la séparation des responsabilités
 */

// Schémas de validation Zod
const signupSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  date_naissance: z.string().optional(),
  tel_indicatif: z.string().optional(),
  tel_numero: z.string().optional(),
  sexe: z.string().optional(),
  adresse: z.string().optional(),
  code_postal: z.string().optional(),
  ville: z.string().optional(),
  // Données optionnelles spécifiques
  patient_data: z
    .object({
      groupe_sanguin: z.string().optional(),
      poids: z.number().optional(),
    })
    .optional(),
  medecin_data: z
    .object({
      specialite: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

const signinSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// Schémas de validation pour les OTP
const loginOTPSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  otp: z
    .string()
    .regex(/^\d{6}$/, "Le code OTP doit contenir 6 chiffres")
    .optional(),
});

const emailOTPSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  otp: z
    .string()
    .regex(/^\d{6}$/, "Le code OTP doit contenir 6 chiffres")
    .optional(),
});

// Schémas de validation pour la réinitialisation de mot de passe
const forgotPasswordSchema = z.object({
  email: z.string().email("Format d'email invalide"),
});

const verifyResetTokenSchema = z.object({
  token: z.string().min(1, "Token requis"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
});

/**
 * Middleware de validation pour l'inscription
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const validateSignupData = (req, res, next) => {
  try {
    console.log("[validateSignupData] Validation des données d'inscription");

    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(
        "[validateSignupData] Erreurs de validation:",
        validationResult.error.errors
      );
      return res.status(400).json({
        message: "Données d'inscription invalides",
        errors: validationResult.error.errors,
      });
    }

    // Stocker les données validées dans req.validatedData
    req.validatedData = validationResult.data;
    console.log("[validateSignupData] Validation réussie");
    next();
  } catch (error) {
    console.error("[validateSignupData] Erreur lors de la validation:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};

/**
 * Middleware de validation pour les OTP de connexion
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const validateLoginOTP = (req, res, next) => {
  try {
    console.log("[validateLoginOTP] Validation des données OTP de connexion");

    const validationResult = loginOTPSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(
        "[validateLoginOTP] Erreurs de validation:",
        validationResult.error.errors
      );
      return res.status(400).json({
        message: "Données OTP invalides",
        errors: validationResult.error.errors,
      });
    }

    // Stocker les données validées dans req.validatedData
    req.validatedData = validationResult.data;
    console.log("[validateLoginOTP] Validation réussie");
    next();
  } catch (error) {
    console.error("[validateLoginOTP] Erreur lors de la validation:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};

/**
 * Middleware de validation pour les OTP de vérification email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const validateEmailOTP = (req, res, next) => {
  try {
    console.log(
      "[validateEmailOTP] Validation des données OTP de vérification"
    );

    const validationResult = emailOTPSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(
        "[validateEmailOTP] Erreurs de validation:",
        validationResult.error.errors
      );
      return res.status(400).json({
        message: "Données OTP invalides",
        errors: validationResult.error.errors,
      });
    }

    // Stocker les données validées dans req.validatedData
    req.validatedData = validationResult.data;
    console.log("[validateEmailOTP] Validation réussie");
    next();
  } catch (error) {
    console.error("[validateEmailOTP] Erreur lors de la validation:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};

/**
 * Middleware de validation pour la connexion
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const validateSigninData = (req, res, next) => {
  try {
    console.log("[validateSigninData] Validation des données de connexion");

    const validationResult = signinSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(
        "[validateSigninData] Erreurs de validation:",
        validationResult.error.errors
      );
      return res.status(400).json({
        message: "Données de connexion invalides",
        errors: validationResult.error.errors,
      });
    }

    // Stocker les données validées dans req.validatedData
    req.validatedData = validationResult.data;
    console.log("[validateSigninData] Validation réussie");
    next();
  } catch (error) {
    console.error("[validateSigninData] Erreur lors de la validation:", error);
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};

/**
 * Middleware de validation pour la demande de réinitialisation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const validateForgotPassword = (req, res, next) => {
  try {
    console.log(
      "[validateForgotPassword] Validation des données de demande de réinitialisation"
    );

    const validationResult = forgotPasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(
        "[validateForgotPassword] Erreurs de validation:",
        validationResult.error.errors
      );
      return res.status(400).json({
        message: "Données de demande de réinitialisation invalides",
        errors: validationResult.error.errors,
      });
    }

    // Stocker les données validées dans req.validatedData
    req.validatedData = validationResult.data;
    console.log("[validateForgotPassword] Validation réussie");
    next();
  } catch (error) {
    console.error(
      "[validateForgotPassword] Erreur lors de la validation:",
      error
    );
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};

/**
 * Middleware de validation pour la vérification du token de réinitialisation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const validateVerifyResetToken = (req, res, next) => {
  try {
    console.log(
      "[validateVerifyResetToken] Validation du token de réinitialisation"
    );

    const validationResult = verifyResetTokenSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(
        "[validateVerifyResetToken] Erreurs de validation:",
        validationResult.error.errors
      );
      return res.status(400).json({
        message: "Token de réinitialisation invalide",
        errors: validationResult.error.errors,
      });
    }

    // Stocker les données validées dans req.validatedData
    req.validatedData = validationResult.data;
    console.log("[validateVerifyResetToken] Validation réussie");
    next();
  } catch (error) {
    console.error(
      "[validateVerifyResetToken] Erreur lors de la validation:",
      error
    );
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};

/**
 * Middleware de validation pour la réinitialisation de mot de passe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 */
export const validateResetPassword = (req, res, next) => {
  try {
    console.log(
      "[validateResetPassword] Validation des données de réinitialisation"
    );

    const validationResult = resetPasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(
        "[validateResetPassword] Erreurs de validation:",
        validationResult.error.errors
      );
      return res.status(400).json({
        message: "Données de réinitialisation invalides",
        errors: validationResult.error.errors,
      });
    }

    // Stocker les données validées dans req.validatedData
    req.validatedData = validationResult.data;
    console.log("[validateResetPassword] Validation réussie");
    next();
  } catch (error) {
    console.error(
      "[validateResetPassword] Erreur lors de la validation:",
      error
    );
    return res.status(500).json({
      message: "Erreur lors de la validation des données",
    });
  }
};
