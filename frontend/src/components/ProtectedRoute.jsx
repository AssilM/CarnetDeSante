import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Afficher un spinner de chargement
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Rediriger vers la page de connexion si non connecté
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && currentUser.role !== requiredRole) {
    // Rediriger vers la page d'accueil appropriée en fonction du rôle de l'utilisateur
    let redirectPath;

    switch (currentUser.role) {
      case "patient":
        redirectPath = "/patient/home";
        break;
      case "medecin":
        redirectPath = "/doctor/home";
        break;
      case "admin":
        redirectPath = "/admin/home";
        break;
      default:
        redirectPath = "/home";
    }

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
