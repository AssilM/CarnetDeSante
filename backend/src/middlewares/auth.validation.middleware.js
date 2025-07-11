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
