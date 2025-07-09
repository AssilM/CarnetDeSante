import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AuthGuard - Composant de protection des routes d'authentification
 *
 * Empêche l'accès aux pages de connexion/inscription pour les utilisateurs déjà connectés
 * Redirige automatiquement vers le dashboard approprié selon le rôle
 */
export const AuthGuard = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Afficher un spinner pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, le rediriger vers son dashboard
  if (currentUser) {
    switch (currentUser.role) {
      case "patient":
        return <Navigate to="/patient/home" replace />;
      case "medecin":
        return <Navigate to="/doctor/home" replace />;
      case "admin":
        return <Navigate to="/admin/home" replace />;
      default:
        // En cas de rôle inconnu, rediriger vers la page de connexion
        return <Navigate to="/auth/login" replace />;
    }
  }

  // Si l'utilisateur n'est pas connecté, afficher la page d'authentification
  return children;
};
