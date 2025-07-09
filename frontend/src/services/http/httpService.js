import axios from "axios";

// URL de base de l'API
const BASE_URL = "http://localhost:5001/api";

// Client HTTP de base avec gestion centralisée des tokens
export const httpService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ===== GESTION CENTRALISÉE DES TOKENS =====

// Variables pour tracker l'état de refresh en cours (évite les appels multiples)
let isRefreshing = false;
let failedQueue = [];
let isSessionExpired = false; // ✅ Nouveau: tracker si la session a déjà été marquée comme expirée

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Fonction pour récupérer le token depuis localStorage
const getAccessToken = () => localStorage.getItem("accessToken");

// Fonction pour sauvegarder le token
const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// ===== INTERCEPTEURS =====

// Intercepteur REQUEST : ajouter automatiquement le token
httpService.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    console.log("[HTTP Service] Ajout du token d'accès à la requête", {
      url: config.url,
    });
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Intercepteur RESPONSE : gestion des erreurs et refresh automatique
httpService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.error("Erreur HTTP:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // ✅ Si la session est déjà expirée, rejeter immédiatement sans refresh
    if (isSessionExpired) {
      return Promise.reject(error);
    }

    // Si c'est une erreur 401 et qu'on n'a pas déjà essayé de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si on est déjà en train de refresh, mettre en queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpService(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        console.log("[HTTP Service] Tentative de refresh automatique");

        // Appel de refresh (utilise le cookie automatiquement)
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {}, // Pas de token pour cette requête
          }
        );

        const newToken = response.data.token;
        console.log("[HTTP Service] Token rafraîchi avec succès");

        // Sauvegarder le nouveau token
        setAccessToken(newToken);

        // Processer la queue des requêtes en attente
        processQueue(null, newToken);

        // Refaire la requête originale
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return httpService(originalRequest);
      } catch (refreshError) {
        console.error("[HTTP Service] Échec du refresh:", refreshError);

        // Marquer la session comme expirée pour éviter les tentatives futures
        isSessionExpired = true;

        // Nettoyer le token invalide
        setAccessToken(null);

        // Processer la queue avec l'erreur
        processQueue(refreshError, null);

        // ✅ NE PAS rediriger si on est sur une page d'authentification
        if (typeof window !== "undefined") {
          const isAuthPage =
            window.location.pathname.includes("/auth/") ||
            window.location.pathname.includes("/login") ||
            window.location.pathname.includes("/register");
          const isSessionPage =
            window.location.pathname.includes("/session-expired");

          if (!isSessionPage && !isAuthPage) {
            console.log("[HTTP Service] Redirection vers session-expired");
            window.location.href = "/session-expired";
          } else {
            console.log(
              "[HTTP Service] Pas de redirection - page auth ou session déjà affichée"
            );
          }
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Gestion des autres erreurs
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        window.location = "/403";
      }
    }

    return Promise.reject(error);
  }
);

// ===== API PUBLIQUE =====

// Fonction pour forcer la déconnexion
export const clearAuth = async () => {
  try {
    // Appeler l'API de déconnexion pour nettoyer le refresh token côté serveur
    await httpService.post("/auth/signout");
  } catch {
    console.log("[HTTP Service] Erreur lors de la déconnexion API (ignorée)");
  } finally {
    // Nettoyer le token local dans tous les cas
    setAccessToken(null);
    // ✅ Réinitialiser l'état d'expiration pour permettre une nouvelle connexion
    isSessionExpired = false;
  }
};

// Fonction pour récupérer le token actuel (pour les rares cas où c'est nécessaire)
export const getCurrentToken = getAccessToken;

// ✅ Fonction pour réinitialiser l'état d'expiration (pour les reconnexions)
export const resetSessionExpired = () => {
  isSessionExpired = false;
  console.log("[HTTP Service] État d'expiration réinitialisé");
};

// ✅ Fonction pour forcer le reset complet (solution de déblocage d'urgence)
export const forceResetAuth = () => {
  isSessionExpired = false;
  isRefreshing = false;
  failedQueue = [];
  console.log("[HTTP Service] Reset complet forcé - état remis à zéro");
};

export default httpService;
