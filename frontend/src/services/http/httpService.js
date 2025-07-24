import axios from "axios";

// URL de base de l'API
const BASE_URL = "http://localhost:5001/api";

// Client HTTP de base avec gestion centralisée des tokens
export const httpService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ===== GESTION CENTRALISÉE DES TOKENS =====
// -------------------------------------------------------------
// Gestion centralisée d'un *callback* optionnel déclenché quand
// la session de l'utilisateur est définitivement expirée après
// échec de rafraîchissement.  Cela permet au reste de l'app (par
// exemple AuthContext) de naviguer proprement via React Router
// au lieu de forcer un rechargement complet du navigateur. Si
// aucun callback n'est fourni, on garde le comportement de
// secours (redirection fenêtre) pour rester rétro-compatible.
// -------------------------------------------------------------

let onSessionExpired = null;
let onForbidden = null; // ✅ Nouveau handler pour les erreurs 403 (accès interdit)

/**
 * Enregistre un gestionnaire appelé UNE SEULE FOIS lorsque la
 * session est considérée comme expirée. Il n'est appelé qu'après
 * l'échec du refresh automatique et avant toute redirection de
 * secours. Passez `null` pour supprimer le gestionnaire.
 */
export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = typeof handler === "function" ? handler : null;
};

/**
 * Enregistre un gestionnaire appelé lorsqu'une réponse 403 est reçue
 * (accès interdit). Permet de naviguer via React Router plutôt que de
 * forcer un rechargement complet. Passez `null` pour supprimer.
 */
export const setForbiddenHandler = (handler) => {
  onForbidden = typeof handler === "function" ? handler : null;
};

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
export const setAccessToken = (token) => {
  try {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
    return true; // réussite
  } catch (err) {
    console.error("[HTTP Service] Impossible de stocker le token", err);
    return false; // échec
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
            // Utiliser le callback React Router si disponible pour éviter
            // un rechargement complet et préserver l'état de l'application.
            if (onSessionExpired) {
              try {
                onSessionExpired();
              } catch (cbErr) {
                console.error(
                  "[HTTP Service] Erreur dans le callback onSessionExpired:",
                  cbErr
                );
                window.location.href = "/session-expired"; // Secours
              }
            } else {
              window.location.href = "/session-expired";
            }
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

    // Gestion des autres erreurs (403 = accès interdit)
    if (error.response?.status === 403) {
      console.log("[HTTP Service] Erreur 403 - Accès interdit détecté");
      
      if (onForbidden) {
        try {
          onForbidden();
        } catch (cbErr) {
          console.error(
            "[HTTP Service] Erreur dans le callback onForbidden:",
            cbErr
          );
          if (typeof window !== "undefined") {
            window.location = "/403"; // Secours
          }
        }
      } else if (typeof window !== "undefined") {
        window.location = "/403";
      }
    }

    // Gestion des erreurs 401 non gérées par le refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[HTTP Service] Erreur 401 non gérée par le refresh - redirection vers login");
      
      // Nettoyer le token invalide
      setAccessToken(null);
      
      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname.includes("/auth/") ||
          window.location.pathname.includes("/login") ||
          window.location.pathname.includes("/register");

        if (!isAuthPage) {
          window.location.href = "/auth/login";
        }
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
