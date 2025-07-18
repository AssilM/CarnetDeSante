import React from "react";
import { useAuth } from "../context/AuthContext";
import BaseProviders from "./core/BaseProviders";
import PatientProviders from "./patient/PatientProviders";
import DoctorProviders from "./staff/DoctorProviders";
import AdminProviders from "./staff/AdminProviders";

/**
 * Gère le chargement conditionnel des providers selon le rôle de l'utilisateur
 * Suppose que AuthProvider est déjà disponible au niveau supérieur
 */
const ConditionalProviders = ({ children }) => {
  const { currentUser } = useAuth();

  // Si l'utilisateur n'est pas connecté ou son rôle est inconnu
  if (!currentUser) {
    return <BaseProviders>{children}</BaseProviders>;
  }

  // Charger les providers appropriés selon le rôle
  switch (currentUser.role) {
    case "patient":
      return (
        <BaseProviders>
          <PatientProviders>{children}</PatientProviders>
        </BaseProviders>
      );

    case "medecin":
      return (
        <BaseProviders>
          <DoctorProviders>{children}</DoctorProviders>
        </BaseProviders>
      );

    case "admin":
      return (
        <BaseProviders>
          <AdminProviders>{children}</AdminProviders>
        </BaseProviders>
      );

    default:
      return <BaseProviders>{children}</BaseProviders>;
  }
};

export default ConditionalProviders;
