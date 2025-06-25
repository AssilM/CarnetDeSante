import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  baseApi,
  authApi,
  createAuthenticatedApi,
  createApiService,
} from "../services/api";

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
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  // Fonction de déconnexion
  const logout = async (expired = false) => {
    // Appeler l'API de déconnexion
    await authApi.logout(refreshToken);

    // Supprimer les tokens et les infos utilisateur
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);

    // Si la session a expiré, rediriger vers la page de session expirée
    if (expired) {
      setSessionExpired(true);
      navigate("/session-expired");
    }
  };

  // Créer une instance API authentifiée avec gestion des tokens
  const authenticatedApi = createAuthenticatedApi({
    accessToken,
    refreshToken,
    onTokenRefreshed: (newToken) => {
      setAccessToken(newToken);
      localStorage.setItem("accessToken", newToken);
    },
    onSessionExpired: () => logout(true),
  });

  // Créer les services API pour les différentes ressources
  const apiService = createApiService(authenticatedApi);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Vérifier la validité du token en récupérant les infos de l'utilisateur
        const userData = await apiService.users.getCurrentUser();
        setCurrentUser(userData.user);
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
        } catch {
          // Si le refresh token est invalide, déconnecter l'utilisateur
          logout(true);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Vérifier périodiquement la validité du token (toutes les 5 secondes)
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const checkTokenInterval = setInterval(async () => {
      try {
        // Essayer de faire une requête pour vérifier si le token est toujours valide
        await apiService.users.getCurrentUser();
      } catch (error) {
        console.log("Vérification du token:", error);
        // Ne rien faire ici, l'intercepteur s'occupera de rafraîchir le token ou de déconnecter l'utilisateur
      }
    }, 5000); // 5 secondes

    return () => clearInterval(checkTokenInterval);
  }, [accessToken, refreshToken]);

  // Fonction pour tester l'expiration du token (pour démonstration)
  const testExpireToken = () => {
    // Simuler un token expiré en le supprimant
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    // Rediriger vers la page de session expirée
    navigate("/session-expired");
  };

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setError(null);
      const authData = await authApi.login(email, password);

      const { token, refreshToken: newRefreshToken, user } = authData;

      // Stocker les tokens et les infos utilisateur
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", newRefreshToken);
      setAccessToken(token);
      setRefreshToken(newRefreshToken);
      setCurrentUser(user);

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
