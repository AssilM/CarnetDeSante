import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  httpService,
  clearAuth,
  getCurrentToken,
  forceResetAuth,
  setForbiddenHandler,
} from "../services/http";
import { authService, createUserService } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Créer le service utilisateur avec useMemo pour éviter la re-création
  const userService = useMemo(() => createUserService(httpService), []);

  // ✅ Fonction pour débloquer complètement l'état (solution d'urgence)
  const forceUnlock = useCallback(() => {
    console.log("[AuthContext] DÉBLOCAGE FORCÉ - Reset complet de l'état");

    forceResetAuth(); // Reset httpService interne

    setCurrentUser(null);
    setLoading(false);
    setError(null);

    console.log("[AuthContext] État complètement réinitialisé");
  }, []);

  // Fonction de déconnexion standard
  const logout = useCallback(async () => {
    console.log("[AuthContext] Déconnexion initiée");

    try {
      // Nettoyer les tokens avec la fonction centralisée
      await clearAuth();
    } finally {
      // Nettoyer les données de session
      setCurrentUser(null);
      navigate("/auth/login");
    }
  }, [navigate]);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = getCurrentToken();
      console.log("[AuthContext] Vérification des tokens au chargement", {
        hasAccessToken: !!accessToken,
        currentPath:
          typeof window !== "undefined" ? window.location.pathname : "unknown",
      });

      // ✅ NOUVELLE LOGIQUE : Gérer les différents cas
      try {
        if (!accessToken) {
          // Cas 1: Pas de token du tout
          console.log(
            "[AuthContext] Aucun token - tentative de refresh automatique"
          );

          // Essayer un refresh automatique (au cas où il y aurait un refresh token)
          try {
            const userData = await userService.getCurrentUser();
            console.log("[AuthContext] Refresh automatique réussi", userData);
            setCurrentUser(userData.user);
          } catch {
            console.log(
              "[AuthContext] Aucun refresh token valide - déconnecté"
            );
            setCurrentUser(null);
          }
        } else {
          // Cas 2: Il y a un token, essayons de l'utiliser
          console.log("[AuthContext] Token présent - validation en cours");

          try {
            const userData = await userService.getCurrentUser();
            console.log(
              "[AuthContext] Token valide - utilisateur connecté",
              userData
            );
            setCurrentUser(userData.user);
          } catch (tokenError) {
            if (tokenError.response?.status === 401) {
              console.log("[AuthContext] Token expiré - tentative de refresh");

              // Cas 2a: Token expiré, attendre le refresh automatique
              // On fait un petit délai pour laisser le temps à l'intercepteur de faire son travail
              await new Promise((resolve) => setTimeout(resolve, 100));

              try {
                // Retenter après le refresh automatique
                const refreshedUserData = await userService.getCurrentUser();
                console.log(
                  "[AuthContext] Refresh automatique réussi",
                  refreshedUserData
                );
                setCurrentUser(refreshedUserData.user);
              } catch {
                console.log(
                  "[AuthContext] Refresh échoué - authentification requise"
                );
                setCurrentUser(null);
              }
            } else {
              // Cas 2b: Autre erreur (réseau, serveur, etc.)
              console.error(
                "[AuthContext] Erreur de récupération des données utilisateur",
                tokenError
              );
              setCurrentUser(null);
            }
          }
        }
      } catch (error) {
        console.error(
          "[AuthContext] Erreur générale lors de la vérification",
          error
        );
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [userService]);

  // --------------------------------------------------
  // Enregistrer un callback pour gérer les erreurs 403
  // --------------------------------------------------
  useEffect(() => {
    // Handler 403 → rediriger vers page 403 dédiée
    const forbiddenHandler = () => {
      console.log("[AuthContext] Callback 403 déclenché");
      navigate("/403", { replace: true });
    };
    setForbiddenHandler(forbiddenHandler);

    // Nettoyage à la destruction du provider
    return () => {
      setForbiddenHandler(null);
    };
  }, [navigate]);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      console.log("[AuthContext] Tentative de connexion", { email });

      setError(null);
      const authData = await authService.login(email, password);
      console.log("[AuthContext] Connexion réussie", {
        hasToken: !!authData.token,
        user: authData.user,
      });

      const { user } = authData;
      // Le token est automatiquement stocké par authService.login

      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error("[AuthContext] Erreur lors de la connexion:", err);

      if (err.message === "STORAGE_FAILED") {
        setError(
          "Connexion impossible : votre navigateur bloque le stockage local. Activez-le ou utilisez un autre navigateur."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Erreur lors de la tentative de connexion"
        );
      }

      throw err; // Propager pour que le composant appelant sache que ça a échoué
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

      // Extraire le rôle pour le passer au service
      const { role, ...userDataWithoutRole } = userData;

      // Appeler le service d'inscription avec le rôle
      const response = await authService.register(userDataWithoutRole, role);
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

  // ✅ Valeurs exposées par le contexte avec useMemo pour éviter les re-renders
  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser, // Expose la fonction pour synchronisation externe
      loading,
      error,
      login,
      logout,
      register,
      forceUnlock, // ✅ Fonction de déblocage d'urgence
    }),
    [
      currentUser,
      loading,
      error,
      login,
      logout,
      register,
      forceUnlock,
      setCurrentUser,
    ]
  );

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
