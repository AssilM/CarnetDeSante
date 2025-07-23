import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  httpService,
  clearAuth,
  getCurrentToken,
  resetSessionExpired,
  forceResetAuth,
  setSessionExpiredHandler,
  setForbiddenHandler,
} from "../services/http";
import { authService, createUserService } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionExpiredRef = useRef(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  // ✅ Créer le service utilisateur avec useMemo pour éviter la re-création
  const userService = useMemo(() => createUserService(httpService), []);

  // ✅ Fonction pour débloquer complètement l'état (solution d'urgence)
  const forceUnlock = useCallback(() => {
    console.log("[AuthContext] DÉBLOCAGE FORCÉ - Reset complet de l'état");

    forceResetAuth(); // Reset httpService interne

    sessionExpiredRef.current = false;
    setSessionExpired(false);
    setCurrentUser(null);
    setLoading(false);
    setError(null);

    console.log("[AuthContext] État complètement réinitialisé");
  }, []);

  // Fonction pour tester ou forcer l'expiration du token
  const testExpireToken = useCallback(() => {
    console.log("[AuthContext] Expiration forcée de la session");

    clearAuth();

    sessionExpiredRef.current = true;
    setSessionExpired(true);
    setCurrentUser(null);

    // Utiliser la navigation React Router pour éviter un reload complet
    navigate("/session-expired", { replace: true });
  }, [navigate]);

  // Fonction de déconnexion standard
  const logout = useCallback(
    async (expired = false) => {
      console.log("[AuthContext] Déconnexion initiée", { expired });

      try {
        // Nettoyer les tokens avec la fonction centralisée
        await clearAuth();
      } finally {
        // Nettoyer les données de session
        setCurrentUser(null);

        // Si la session a expiré, rediriger vers la page de session expirée
        if (expired) {
          testExpireToken();
        } else {
          navigate("/auth/login");
        }
      }
    },
    [navigate, testExpireToken]
  );

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const verifyToken = async () => {
      // ✅ Si on est sur la page session-expired, ne pas vérifier automatiquement
      // MAIS garder les fonctions login/logout disponibles pour la reconnexion
      if (
        typeof window !== "undefined" &&
        window.location.pathname.includes("/session-expired")
      ) {
        console.log(
          "[AuthContext] Sur la page session-expired, pas de vérification automatique"
        );
        setLoading(false);
        setCurrentUser(null); // S'assurer qu'on est déconnecté
        return; // ✅ Permettre les fonctions login/logout pour la reconnexion
      }

      const accessToken = getCurrentToken();
      console.log("[AuthContext] Vérification des tokens au chargement", {
        hasAccessToken: !!accessToken,
        isSessionExpired: sessionExpiredRef.current,
        currentPath: typeof window !== "undefined" ? window.location.pathname : "unknown",
      });

      // ✅ Si la session est marquée comme expirée, permettre quand même l'accès aux pages d'auth
      if (sessionExpiredRef.current) {
        // Si on est sur une page d'authentification, réinitialiser l'état
        const isAuthPage =
          typeof window !== "undefined" &&
          (window.location.pathname.includes("/auth/") ||
            window.location.pathname.includes("/login") ||
            window.location.pathname.includes("/register"));

        if (isAuthPage) {
          console.log(
            "[AuthContext] Page d'auth détectée - réinitialisation de l'état d'expiration"
          );
          sessionExpiredRef.current = false;
          setSessionExpired(false);
          resetSessionExpired();
        } else {
          setLoading(false);
          return;
        }
      }

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
                  "[AuthContext] Refresh échoué - session vraiment expirée"
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
  // Enregistrer un callback pour gérer la fin de session
  // --------------------------------------------------
  useEffect(() => {
    const handler = () => {
      console.log("[AuthContext] Callback session expirée déclenché");
      sessionExpiredRef.current = true;
      setSessionExpired(true);
      setCurrentUser(null);
      navigate("/session-expired", { replace: true });
    };

    // Enregistrement auprès du httpService
    setSessionExpiredHandler(handler);

    // Handler 403 → rediriger vers page 403 dédiée
    const forbiddenHandler = () => {
      console.log("[AuthContext] Callback 403 déclenché");
      navigate("/403", { replace: true });
    };
    setForbiddenHandler(forbiddenHandler);

    // Nettoyage à la destruction du provider
    return () => {
      setSessionExpiredHandler(null);
      setForbiddenHandler(null);
    };
  }, [navigate]);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      console.log("[AuthContext] Tentative de connexion", { email });

      // ✅ Réinitialiser l'état d'expiration de session (local ET httpService)
      sessionExpiredRef.current = false;
      setSessionExpired(false);

      // ✅ Réinitialiser l'état d'expiration dans httpService sans logout
      resetSessionExpired();

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
      sessionExpired,
      testExpireToken,
      forceUnlock, // ✅ Fonction de déblocage d'urgence
    }),
    [
      currentUser,
      loading,
      error,
      login,
      logout,
      register,
      sessionExpired,
      testExpireToken,
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
