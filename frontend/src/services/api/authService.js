import httpService from "../http/httpService";

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
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user,
      });
      return response.data;
    } catch (error) {
      console.error("[Auth Service] Erreur lors de la connexion:", error);
      throw error;
    }
  },

  /**
   * Inscrit un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur à inscrire
   * @returns {Promise<Object>} Données de l'utilisateur créé
   */
  register: async (userData) => {
    console.log("[Auth Service] Tentative d'inscription");

    try {
      const response = await httpService.post("/auth/signup", userData);
      console.log("[Auth Service] Inscription réussie");
      return response.data;
    } catch (error) {
      console.error("[Auth Service] Erreur lors de l'inscription:", error);
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur courant
   * @param {string} refreshToken - Token de rafraîchissement à invalider
   * @returns {Promise<void>}
   */
  logout: async (refreshToken) => {
    console.log("[Auth Service] Tentative de déconnexion", {
      hasRefreshToken: !!refreshToken,
    });

    if (!refreshToken) return;

    try {
      await httpService.post("/auth/signout", { refreshToken });
      console.log("[Auth Service] Déconnexion réussie");
    } catch (error) {
      console.error("[Auth Service] Erreur lors de la déconnexion:", error);
      // Ne pas propager l'erreur pour permettre la déconnexion même en cas d'échec API
    }
  },

  /**
   * Rafraîchit le token d'accès
   * @param {string} refreshToken - Token de rafraîchissement
   * @returns {Promise<Object>} Nouveau token d'accès
   */
  refreshToken: async (refreshToken) => {
    console.log("[Auth Service] Tentative de rafraîchissement du token");

    try {
      const response = await httpService.post("/auth/refresh-token", {
        refreshToken,
      });
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

  /**
   * Diagnostique les problèmes d'authentification
   * Vérifie l'état du token, le rôle de l'utilisateur et la consistance des données
   * @returns {Promise<Object>} Résultats du diagnostic
   */
  checkAuth: async () => {
    console.log("[Auth Service] Vérification de l'authentification");

    try {
      const response = await httpService.get("/auth/check-auth");
      console.log(
        "[Auth Service] Résultats du diagnostic d'authentification:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[Auth Service] Erreur lors du diagnostic d'authentification:",
        error
      );
      throw error;
    }
  },
};

export default authService;
