import React from "react";
import { useAuth } from "../context/AuthContext";
import BaseProviders from "./core/BaseProviders";
import PatientProviders from "./patient/PatientProviders";
import StaffProviders from "./staff/StaffProviders";

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
    case "admin":
      return (
        <BaseProviders>
          <StaffProviders>{children}</StaffProviders>
        </BaseProviders>
      );

    default:
      return <BaseProviders>{children}</BaseProviders>;
  }
};

export default ConditionalProviders;
