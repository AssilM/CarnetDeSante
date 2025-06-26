import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  baseApi,
  authApi,
  createAuthenticatedApi,
  createApiService,
} from "../services/api";

// Variable globale pour suivre l'état d'expiration
let SESSION_EXPIRED = false;

// =====================================================
// CONFIGURATION GLOBALE - Durée d'expiration en secondes
// Modifiez cette valeur pour changer le temps d'expiration
// Cette valeur doit correspondre à celle du backend (TEMPS_EXPIRATION)
// =====================================================
const TEMPS_EXPIRATION = 6000;
// =====================================================

// Durée d'inactivité avant déconnexion (en secondes)
const INACTIVITY_TIMEOUT = TEMPS_EXPIRATION;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(SESSION_EXPIRED);
  const logoutTimerRef = useRef(null); // Référence pour le timer de déconnexion automatique
  const navigate = useNavigate();

  // Fonction pour tester ou forcer l'expiration du token
  const testExpireToken = () => {
    console.log("Expiration forcée de la session");

    // Nettoyer les données de session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Marquer la session comme expirée
    SESSION_EXPIRED = true;
    setSessionExpired(true);

    // Redirection forcée et complète
    window.location.href = "/session-expired";
  };

  // Fonction pour configurer la déconnexion automatique après un délai d'inactivité
  const autoLogout = (timeInSeconds = INACTIVITY_TIMEOUT) => {
    console.log(
      `Configuration de la déconnexion automatique après ${timeInSeconds} secondes d'inactivité`
    );

    // Annuler tout timer existant
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // Configurer le timer de déconnexion automatique
    logoutTimerRef.current = setTimeout(() => {
      console.log("Déconnexion automatique déclenchée après inactivité");
      testExpireToken();
    }, timeInSeconds * 1000);

    return timeInSeconds; // Retourner la valeur pour confirmation
  };

  // Fonction de déconnexion standard
  const logout = async (expired = false) => {
    try {
      // Annuler tout timer de déconnexion automatique
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }

      // Appeler l'API de déconnexion si possible
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {
          console.log("Erreur lors de la déconnexion API");
        });
      }
    } finally {
      // Nettoyer les données de session
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setRefreshToken(null);
      setCurrentUser(null);

      // Si la session a expiré, rediriger vers la page de session expirée
      if (expired) {
        testExpireToken();
      } else {
        navigate("/auth/login");
      }
    }
  };

  // Créer une instance API authentifiée avec gestion des tokens
  const authenticatedApi = createAuthenticatedApi({
    accessToken,
    refreshToken,
    onTokenRefreshed: (newToken) => {
      setAccessToken(newToken);
      localStorage.setItem("accessToken", newToken);
      // Réinitialiser le timer d'inactivité quand le token est rafraîchi
      if (currentUser) {
        autoLogout();
      }
    },
    onSessionExpired: () => testExpireToken(),
  });

  // Créer les services API pour les différentes ressources
  const apiService = createApiService(authenticatedApi);

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const verifyToken = async () => {
      // Si la session est déjà marquée comme expirée, ne rien faire
      if (SESSION_EXPIRED) {
        setLoading(false);
        return;
      }

      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Vérifier la validité du token en récupérant les infos de l'utilisateur
        const userData = await apiService.users.getCurrentUser();
        setCurrentUser(userData.user);
        // Initialiser le timer d'inactivité
        autoLogout();
      } catch {
        // Si le token est invalide, essayer de le rafraîchir
        try {
          const refreshResponse = await baseApi.post("/auth/refresh-token", {
            refreshToken,
          });

          setAccessToken(refreshResponse.data.token);
          localStorage.setItem("accessToken", refreshResponse.data.token);

          // Récupérer les infos de l'utilisateur avec le nouveau token
          const userData = await apiService.users.getCurrentUser();
          setCurrentUser(userData.user);
          // Initialiser le timer d'inactivité
          autoLogout();
        } catch {
          // Si le refresh token est invalide, déconnecter l'utilisateur
          testExpireToken();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Ajouter des écouteurs d'événements pour détecter l'activité de l'utilisateur
  useEffect(() => {
    // Ne pas ajouter les écouteurs si pas d'utilisateur connecté
    if (!currentUser) return;

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Gestionnaire d'événements pour réinitialiser le timer à chaque activité
    const handleUserActivity = () => {
      autoLogout();
    };

    // Ajouter les écouteurs pour tous les événements
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Nettoyer les écouteurs lors du démontage
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [currentUser]);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      // Réinitialiser l'état d'expiration de session
      SESSION_EXPIRED = false;
      setSessionExpired(false);

      setError(null);
      const authData = await authApi.login(email, password);

      const { token, refreshToken: newRefreshToken, user } = authData;

      // Stocker les tokens et les infos utilisateur
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", newRefreshToken);
      setAccessToken(token);
      setRefreshToken(newRefreshToken);
      setCurrentUser(user);

      // Configurer le timer d'inactivité
      autoLogout();

      return user;
    } catch (error) {
      setError(error.response?.data?.message || "Erreur de connexion");
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      setError(error.response?.data?.message || "Erreur d'inscription");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accessToken,
        loading,
        error,
        sessionExpired,
        login,
        register,
        logout,
        api: authenticatedApi,
        apiService,
        testExpireToken, // Fonction pour tester l'expiration du token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};
