import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { httpService } from "../services/http";
import { authService, createUserService } from "../services/api";

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
  const eventsSetupRef = useRef(false); // Référence pour suivre si les écouteurs d'événements sont déjà configurés
  const navigate = useNavigate();

  // Créer le service utilisateur
  const userService = createUserService(httpService);

  // Fonction pour tester ou forcer l'expiration du token
  const testExpireToken = useCallback(() => {
    console.log("[AuthContext] Expiration forcée de la session");

    // Nettoyer les données de session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Marquer la session comme expirée
    SESSION_EXPIRED = true;
    setSessionExpired(true);

    // Redirection forcée et complète
    window.location.href = "/session-expired";
  }, []);

  // Fonction pour configurer la déconnexion automatique après un délai d'inactivité
  const autoLogout = useCallback(
    (timeInSeconds = INACTIVITY_TIMEOUT) => {
      console.log(
        `[AuthContext] Configuration de la déconnexion automatique après ${timeInSeconds} secondes d'inactivité`
      );

      // Annuler tout timer existant
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      // Configurer le timer de déconnexion automatique
      logoutTimerRef.current = setTimeout(() => {
        console.log(
          "[AuthContext] Déconnexion automatique déclenchée après inactivité"
        );
        testExpireToken();
      }, timeInSeconds * 1000);

      return timeInSeconds; // Retourner la valeur pour confirmation
    },
    [testExpireToken]
  );

  // Fonction de déconnexion standard
  const logout = useCallback(
    async (expired = false) => {
      console.log("[AuthContext] Déconnexion initiée", { expired });

      try {
        // Annuler tout timer de déconnexion automatique
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
          logoutTimerRef.current = null;
        }

        // Appeler l'API de déconnexion si possible
        if (refreshToken) {
          await authService.logout(refreshToken).catch(() => {
            console.log("[AuthContext] Erreur lors de la déconnexion API");
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
    },
    [refreshToken, navigate, testExpireToken]
  );

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const verifyToken = async () => {
      console.log("[AuthContext] Vérification des tokens au chargement", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isSessionExpired: SESSION_EXPIRED,
      });

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
        console.log(
          "[AuthContext] Tentative de récupération des infos utilisateur"
        );
        // Vérifier la validité du token en récupérant les infos de l'utilisateur
        const userData = await userService.getCurrentUser();
        console.log(
          "[AuthContext] Infos utilisateur récupérées avec succès",
          userData
        );
        setCurrentUser(userData.user);
        // Initialiser le timer d'inactivité
        autoLogout();
      } catch (error) {
        console.log(
          "[AuthContext] Échec de récupération des infos utilisateur",
          error
        );
        // Si le token est invalide, essayer de le rafraîchir
        try {
          console.log("[AuthContext] Tentative de rafraîchissement du token");
          const refreshResponse = await httpService.post(
            "/auth/refresh-token",
            {
              refreshToken,
            }
          );

          console.log("[AuthContext] Token rafraîchi avec succès");
          setAccessToken(refreshResponse.data.token);
          localStorage.setItem("accessToken", refreshResponse.data.token);

          // Récupérer les infos de l'utilisateur avec le nouveau token
          console.log(
            "[AuthContext] Récupération des infos utilisateur avec le nouveau token"
          );
          const userData = await userService.getCurrentUser();
          console.log(
            "[AuthContext] Infos utilisateur récupérées avec succès",
            userData
          );
          setCurrentUser(userData.user);
          // Initialiser le timer d'inactivité
          autoLogout();
        } catch (refreshError) {
          console.error(
            "[AuthContext] Échec du rafraîchissement du token",
            refreshError
          );
          // Si le refresh token est invalide, déconnecter l'utilisateur
          testExpireToken();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [accessToken, refreshToken, autoLogout, testExpireToken]);

  // Ajouter des écouteurs d'événements pour détecter l'activité de l'utilisateur
  useEffect(() => {
    // Ne pas ajouter les écouteurs si pas d'utilisateur connecté
    if (!currentUser) return;

    // Éviter d'ajouter les écouteurs plusieurs fois
    if (eventsSetupRef.current) return;

    console.log(
      "[AuthContext] Configuration des écouteurs d'événements pour l'activité utilisateur"
    );
    eventsSetupRef.current = true;

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
      console.log("[AuthContext] Nettoyage des écouteurs d'événements");
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      eventsSetupRef.current = false;
    };
  }, [currentUser, autoLogout]);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      console.log("[AuthContext] Tentative de connexion", { email });

      // Réinitialiser l'état d'expiration de session
      SESSION_EXPIRED = false;
      setSessionExpired(false);

      setError(null);
      const authData = await authService.login(email, password);
      console.log("[AuthContext] Connexion réussie", {
        hasToken: !!authData.token,
        hasRefreshToken: !!authData.refreshToken,
        user: authData.user,
      });

      const { token, refreshToken: newRefreshToken, user } = authData;

      // Stocker les tokens et les informations utilisateur
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", newRefreshToken);
      setAccessToken(token);
      setRefreshToken(newRefreshToken);
      setCurrentUser(user);

      // Initialiser le timer d'inactivité
      autoLogout();

      return user;
    } catch (err) {
      console.error("[AuthContext] Erreur lors de la connexion:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la tentative de connexion"
      );
      throw err;
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      console.log("[AuthContext] Tentative d'inscription", {
        email: userData.email,
        role: userData.role,
      });

      // Vérifier que les données requises sont présentes
      if (!userData.email || !userData.password || !userData.role) {
        throw new Error("Données d'inscription incomplètes");
      }

      // Assurer que les données téléphoniques sont correctement formatées
      if (userData.tel_indicatif && userData.tel_numero) {
        // Nettoyer les espaces dans le numéro
        userData.tel_numero = userData.tel_numero.replace(/\s/g, "");
      }

      // Appeler le service d'inscription
      const response = await authService.register(userData);
      console.log("[AuthContext] Inscription réussie", response);

      // Pas de connexion automatique après l'inscription
      // L'utilisateur sera redirigé vers la page de connexion
      return response.data;
    } catch (error) {
      console.error("[AuthContext] Erreur lors de l'inscription", error);
      // Propager l'erreur pour la gestion dans le composant
      throw error;
    }
  };

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  // Valeurs exposées par le contexte
  const value = {
    currentUser,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    logout,
    register,
    sessionExpired,
    testExpireToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé avec un AuthProvider");
  }
  return context;
};
