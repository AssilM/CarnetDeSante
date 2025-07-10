import {
  createUser,
  authenticateUser,
  refreshUserToken,
  signoutUser,
  getCurrentUser,
} from "../services/auth.service.js";
import { setRefreshTokenCookie } from "../utils/auth.utils.js";

// ✅ REFACTORING : Validation ZOD déplacée vers auth.validation.middleware.js
// Les données sont maintenant prévalidées dans req.validatedData

/**
 * Fonction interne qui gère l'inscription avec un rôle forcé
 * @param {Object} req - Requête Express (contient req.validatedData depuis le middleware)
 * @param {Object} res - Réponse Express
 * @param {Function} next - Next middleware
 * @param {string} forcedRole - Rôle imposé par la route
 */
const performSignup = async (req, res, next, forcedRole) => {
  try {
    // 1. Récupérer les données prévalidées par le middleware
    const userData = req.validatedData;

    console.log(
      `Controller: Tentative d'inscription (${forcedRole}) pour :`,
      userData.email
    );

    // 2. Déléguer la logique métier au service
    const user = await createUser(userData, forcedRole);

    // 3. Retourner la réponse HTTP
    res.status(201).json({
      message:
        "Compte créé. Veuillez vérifier votre e-mail pour activer votre compte.",
      user,
    });
  } catch (error) {
    // Gestion des erreurs métier du service
    if (error.message === "Cet email est déjà utilisé") {
      return res.status(400).json({ message: error.message });
    }

    if (
      error.message.includes("date de naissance") ||
      error.message.includes("ans")
    ) {
      return res.status(400).json({ message: error.message });
    }

    // Erreurs techniques - passer au middleware d'erreur
    console.error("Controller: Erreur lors de l'inscription:", error);
    next(error);
  }
};

/**
 * Inscription patient
 */
export const signupPatient = async (req, res, next) => {
  await performSignup(req, res, next, "patient");
};

/**
 * Inscription médecin
 */
export const signupMedecin = async (req, res, next) => {
  await performSignup(req, res, next, "medecin");
};

/**
 * Inscription générique (compatibilité) - crée un patient
 */
export const signup = signupPatient;

/**
 * Connexion d'un utilisateur
 */
export const signin = async (req, res, next) => {
  try {
    // 1. Récupérer les données prévalidées par le middleware
    const { email, password } = req.validatedData;

    console.log("Controller: Tentative de connexion pour:", email);

    // 2. Déléguer au service
    const { user, accessToken, refreshToken } = await authenticateUser(
      email,
      password
    );

    // 3. Gérer le cookie refresh token
    setRefreshTokenCookie(res, refreshToken);

    // 4. Retourner la réponse
    res.status(200).json({
      token: accessToken,
      user,
    });
  } catch (error) {
    // Gestion des erreurs d'authentification
    if (error.message === "Email ou mot de passe incorrect") {
      return res.status(401).json({ message: error.message });
    }

    // Erreurs techniques
    console.error("Controller: Erreur lors de la connexion:", error);
    next(error);
  }
};

/**
 * Refresh token
 */
export const refreshToken = async (req, res, next) => {
  try {
    // 1. Récupérer le refresh token depuis le cookie
    const currentRefreshToken = req.cookies?.jid;

    console.log("Controller: Demande de refresh token");

    // 2. Déléguer au service
    const { user, accessToken, newRefreshToken } = await refreshUserToken(
      currentRefreshToken
    );

    // 3. Mettre à jour le cookie
    setRefreshTokenCookie(res, newRefreshToken);

    // 4. Retourner la réponse
    res.status(200).json({
      message: "Token rafraîchi avec succès",
      token: accessToken,
    });
  } catch (error) {
    // Gestion des erreurs de refresh
    if (
      error.message === "Refresh token manquant" ||
      error.message === "Token invalide" ||
      error.message.includes("Déconnexion de sécurité")
    ) {
      return res.status(401).json({ message: error.message });
    }

    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    // Erreurs techniques
    console.error("Controller: Erreur lors du refresh token:", error);
    next(error);
  }
};

/**
 * Déconnexion
 */
export const signout = async (req, res, next) => {
  try {
    // 1. Récupérer les paramètres
    const refreshToken = req.cookies?.jid;
    const allDevices = req.query.all === "true";
    const userId = req.userId; // Fourni par le middleware authenticate

    console.log("Controller: Demande de déconnexion", { allDevices, userId });

    // 2. Déléguer au service
    await signoutUser(refreshToken, userId, allDevices);

    // 3. Supprimer le cookie côté client
    res.clearCookie("jid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // 4. Retourner la réponse
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    // Toutes les erreurs de déconnexion sont techniques
    console.error("Controller: Erreur lors de la déconnexion:", error);
    next(error);
  }
};

/**
 * Récupérer les informations de l'utilisateur connecté
 */
export const getMe = async (req, res, next) => {
  try {
    // 1. Récupérer l'ID utilisateur du middleware
    const userId = req.userId;

    console.log(
      "Controller: Récupération des infos pour l'utilisateur:",
      userId
    );

    // 2. Déléguer au service
    const user = await getCurrentUser(userId);

    // 3. Retourner la réponse
    res.status(200).json({ user });
  } catch (error) {
    // Gestion des erreurs
    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    // Erreurs techniques
    console.error(
      "Controller: Erreur lors de la récupération utilisateur:",
      error
    );
    next(error);
  }
};
