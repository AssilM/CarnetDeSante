import httpService from "../http/httpService";
import { setAccessToken } from "../http/httpService";

/**
 * Service d'authentification
 * Gère les opérations liées à l'authentification des utilisateurs
 */
const authService = {
  /**
   * Connecte un utilisateur avec son email et mot de passe
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<Object>} Données de l'utilisateur connecté avec tokens
   */
  login: async (email, password) => {
    console.log("[Auth Service] Tentative de connexion", { email });

    try {
      const response = await httpService.post("/auth/signin", {
        email,
        password,
      });
      console.log("[Auth Service] Connexion réussie", {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
      });
      const { token, user } = response.data;

      // Stocker immédiatement le token pour les requêtes suivantes
      const stored = setAccessToken(token);
      if (!stored) {
        throw new Error("STORAGE_FAILED");
      }
      return { token, user };
    } catch (error) {
      console.error("[Auth Service] Erreur lors de la connexion:", error);
      throw error;
    }
  },

  /**
   * Demande un OTP pour la connexion
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<Object>} Informations sur l'envoi de l'OTP
   */
  requestLoginOTP: async (email, password) => {
    console.log("[Auth Service] Demande OTP de connexion", { email });

    try {
      const response = await httpService.post("/auth/login/request-otp", {
        email,
        password,
      });
      console.log("[Auth Service] OTP de connexion envoyé");
      return response.data;
    } catch (error) {
      console.error("[Auth Service] Erreur lors de la demande OTP:", error);
      throw error;
    }
  },

  /**
   * Connecte un utilisateur avec OTP
   * @param {string} email - Email de l'utilisateur
   * @param {string} otp - Code OTP
   * @returns {Promise<Object>} Données de l'utilisateur connecté avec tokens
   */
  loginWithOTP: async (email, otp) => {
    console.log("[Auth Service] Tentative de connexion OTP", { email });

    try {
      const response = await httpService.post("/auth/login/verify-otp", {
        email,
        otp,
      });
      console.log("[Auth Service] Connexion OTP réussie", {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
      });
      const { token, user } = response.data;

      // Stocker immédiatement le token pour les requêtes suivantes
      const stored = setAccessToken(token);
      if (!stored) {
        throw new Error("STORAGE_FAILED");
      }
      return { token, user };
    } catch (error) {
      console.error("[Auth Service] Erreur lors de la connexion OTP:", error);
      throw error;
    }
  },

  /**
   * Inscrit un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur à inscrire
   * @param {string} role - Rôle de l'utilisateur (patient, medecin) - optionnel, par défaut patient
   * @returns {Promise<Object>} Données de l'utilisateur créé
   */
  register: async (userData, role = "patient") => {
    console.log("[Auth Service] Tentative d'inscription", { role });

    try {
      // Déterminer l'endpoint en fonction du rôle
      const endpoint =
        role === "medecin" ? "/auth/signup/medecin" : "/auth/signup";

      const response = await httpService.post(endpoint, userData);
      console.log("[Auth Service] Inscription réussie");
      return response.data;
    } catch (error) {
      console.error("[Auth Service] Erreur lors de l'inscription:", error);
      throw error;
    }
  },

  /**
   * Inscrit un nouveau médecin (alias pour register avec rôle médecin)
   * @param {Object} userData - Données du médecin à inscrire
   * @returns {Promise<Object>} Données du médecin créé
   */
  registerMedecin: async (userData) => {
    return authService.register(userData, "medecin");
  },

  /**
   * Vérifie l'OTP d'inscription et active le compte
   * @param {string} email - Email de l'utilisateur
   * @param {string} otp - Code OTP
   * @returns {Promise<Object>} Informations sur la vérification
   */
  verifyEmailOTP: async (email, otp) => {
    console.log("[Auth Service] Vérification OTP d'inscription", { email });

    try {
      const response = await httpService.post("/auth/verify-email", {
        email,
        otp,
      });
      console.log("[Auth Service] Email vérifié avec succès");
      return response.data;
    } catch (error) {
      console.error(
        "[Auth Service] Erreur lors de la vérification email:",
        error
      );
      throw error;
    }
  },

  /**
   * Renvoie un OTP de vérification email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} Informations sur l'envoi
   */
  resendVerificationOTP: async (email) => {
    console.log("[Auth Service] Renvoi OTP de vérification", { email });

    try {
      const response = await httpService.post("/auth/resend-verification", {
        email,
      });
      console.log("[Auth Service] OTP de vérification renvoyé");
      return response.data;
    } catch (error) {
      console.error("[Auth Service] Erreur lors du renvoi OTP:", error);
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur courant
   * @returns {Promise<void>}
   */
  logout: async () => {
    console.log("[Auth Service] Tentative de déconnexion");

    try {
      await httpService.post("/auth/signout");
      console.log("[Auth Service] Déconnexion réussie");
    } catch (error) {
      console.error("[Auth Service] Erreur lors de la déconnexion:", error);
      // Ne pas propager l'erreur pour permettre la déconnexion même en cas d'échec API
    }
  },

  /**
   * Rafraîchit le token d'accès
   * @returns {Promise<Object>} Nouveau token d'accès
   */
  refreshToken: async () => {
    console.log("[Auth Service] Tentative de rafraîchissement du token");

    try {
      const response = await httpService.post("/auth/refresh-token");
      console.log("[Auth Service] Token rafraîchi avec succès");
      return response.data;
    } catch (error) {
      console.error(
        "[Auth Service] Erreur lors du rafraîchissement du token:",
        error
      );
      throw error;
    }
  },
};

export default authService;
