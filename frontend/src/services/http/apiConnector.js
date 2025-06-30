import axios from "axios";
import httpService from "./httpService";

/**
 * Crée une instance API authentifiée avec gestion automatique des tokens
 * @param {Object} options - Options de configuration
 * @param {string} options.accessToken - Token d'accès JWT
 * @param {string} options.refreshToken - Token de rafraîchissement
 * @param {Function} options.onTokenRefreshed - Callback appelé quand un token est rafraîchi
 * @param {Function} options.onSessionExpired - Callback appelé quand la session expire
 * @returns {Object} Instance axios configurée
 */
export const createAuthConnector = ({
  accessToken,
  refreshToken,
  onTokenRefreshed,
  onSessionExpired,
}) => {
  // Créer une instance axios avec l'URL de base
  const apiConnector = axios.create({
    baseURL: httpService.defaults.baseURL,
  });

  // Intercepteur pour ajouter le token à chaque requête
  apiConnector.interceptors.request.use((config) => {
    console.log("[Auth Connector] Ajout du token à la requête", {
      url: config.url,
      hasToken: !!accessToken,
      token: accessToken ? `${accessToken.substring(0, 10)}...` : null,
    });

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Intercepteur pour gérer les erreurs 401 (token expiré)
  apiConnector.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      console.log("[Auth Connector] Erreur de réponse", {
        status: error.response?.status,
        url: originalRequest?.url,
        retry: !!originalRequest?._retry,
        hasRefreshToken: !!refreshToken,
        message: error.response?.data?.message || error.message,
      });

      // Si l'erreur est 401 et qu'on n'a pas déjà essayé de rafraîchir le token
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        refreshToken
      ) {
        originalRequest._retry = true;
        console.log("[Auth Connector] Tentative de rafraîchissement du token");

        try {
          // Demander un nouveau token avec le refresh token
          const response = await httpService.post("/auth/refresh-token", {
            refreshToken,
          });

          // Récupérer le nouveau token
          const newAccessToken = response.data.token;
          console.log("[Auth Connector] Token rafraîchi avec succès");

          // Appeler le callback pour mettre à jour le token dans le contexte parent
          if (onTokenRefreshed) {
            onTokenRefreshed(newAccessToken);
          }

          // Refaire la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiConnector(originalRequest);
        } catch (refreshError) {
          console.error(
            "[Auth Connector] Échec du rafraîchissement du token",
            refreshError
          );

          // Si le refresh token est invalide, signaler l'expiration de la session
          if (onSessionExpired) {
            console.log("[Auth Connector] Appel du callback onSessionExpired");
            onSessionExpired();
          }
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return apiConnector;
};

export default createAuthConnector;
