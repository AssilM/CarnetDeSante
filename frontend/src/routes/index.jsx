import React from "react";
import { Routes, Route } from "react-router-dom";

// Routes par catégorie d'utilisateur
import AuthRoutes from "./AuthRoutes";
import PatientRoutes from "./PatientRoutes";
import DoctorRoutes from "./DoctorRoutes";
import AdminRoutes from "./AdminRoutes";
import MedicalRoutes from "./MedicalRoutes";

// Pages d'erreur
import Forbidden from "../pages/Forbidden";

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
      {[...AuthRoutes, ...PatientRoutes, ...DoctorRoutes, ...AdminRoutes, ...MedicalRoutes]}

      {/* Routes d'erreur */}
      <Route path="/403" element={<Forbidden />} />
    </Routes>
  );
};

export default AppRoutes;
