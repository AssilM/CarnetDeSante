import axios from "axios";

// URL de base de l'API
const BASE_URL = "http://localhost:5001/api";

// Création de l'instance axios de base (sans authentification)
export const baseApi = axios.create({
  baseURL: BASE_URL,
});

/**
 * Crée une instance API authentifiée avec gestion automatique des tokens
 * @param {Object} options - Options de configuration
 * @param {string} options.accessToken - Token d'accès JWT
 * @param {string} options.refreshToken - Token de rafraîchissement
 * @param {Function} options.onTokenRefreshed - Callback appelé quand un token est rafraîchi
 * @param {Function} options.onSessionExpired - Callback appelé quand la session expire
 * @returns {Object} Instance axios configurée
 */
export const createAuthenticatedApi = ({
  accessToken,
  refreshToken,
  onTokenRefreshed,
  onSessionExpired,
}) => {
  // Créer une instance axios avec l'URL de base
  const api = axios.create({
    baseURL: BASE_URL,
  });

  // Intercepteur pour ajouter le token à chaque requête
  api.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Intercepteur pour gérer les erreurs 401 (token expiré)
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Si l'erreur est 401 et qu'on n'a pas déjà essayé de rafraîchir le token
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        refreshToken
      ) {
        originalRequest._retry = true;

        try {
          // Demander un nouveau token avec le refresh token
          const response = await baseApi.post("/auth/refresh-token", {
            refreshToken,
          });

          // Récupérer le nouveau token
          const newAccessToken = response.data.token;

          // Appeler le callback pour mettre à jour le token dans le contexte parent
          if (onTokenRefreshed) {
            onTokenRefreshed(newAccessToken);
          }

          // Refaire la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          // Si le refresh token est invalide, signaler l'expiration de la session
          if (onSessionExpired) {
            onSessionExpired();
          }
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// Fonctions d'API pour l'authentification (sans token requis)
export const authApi = {
  login: async (email, password) => {
    const response = await baseApi.post("/auth/signin", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await baseApi.post("/auth/signup", userData);
    return response.data;
  },

  logout: async (refreshToken) => {
    if (refreshToken) {
      try {
        await baseApi.post("/auth/signout", { refreshToken });
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
    }
  },
};

// Fonction factory pour créer des API pour différentes ressources
export const createApiService = (api) => {
  return {
    // API utilisateurs
    users: {
      getAll: async () => {
        const response = await api.get("/users");
        return response.data;
      },

      getById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
      },

      getByRole: async (role) => {
        const response = await api.get(`/users/role/${role}`);
        return response.data;
      },

      update: async (userId, userData) => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
      },

      updatePassword: async (userId, { currentPassword, newPassword }) => {
        const response = await api.put(`/users/${userId}/password`, {
          currentPassword,
          newPassword,
        });
        return response.data;
      },

      delete: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
      },

      getCurrentUser: async () => {
        const response = await api.get("/users/me");
        return response.data;
      },
    },

    // Ajouter d'autres API ici (documents, rendez-vous, etc.)
  };
};
