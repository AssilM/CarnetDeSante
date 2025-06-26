import React from "react";
import { Routes } from "react-router-dom";

// Routes par catégorie d'utilisateur
import AuthRoutes from "./AuthRoutes";
import PatientRoutes from "./PatientRoutes";
import StaffRoutes from "./StaffRoutes";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Export des composants layouts
export { AuthLayout, MainLayout };

/**
 * Composant principal de routage
 * Organise toutes les routes de l'application par rôle utilisateur
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Déployer les tableaux de routes */}
      {[...AuthRoutes, ...PatientRoutes, ...StaffRoutes]}
    </Routes>
  );
};

export default AppRoutes;
