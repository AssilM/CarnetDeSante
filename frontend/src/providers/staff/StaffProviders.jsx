import React from "react";
import { useAuth } from "../../context/AuthContext";
import DoctorProviders from "./DoctorProviders";
import AdminProviders from "./AdminProviders";

/**
 * Providers conditionnels selon le rôle de l'utilisateur
 * Charge les providers appropriés selon le rôle (médecin ou administrateur)
 */
const StaffProviders = ({ children }) => {
  const { currentUser } = useAuth();

  // Si l'utilisateur est admin, utiliser AdminProviders
  if (currentUser?.role === "admin") {
    return <AdminProviders>{children}</AdminProviders>;
  }

  // Si l'utilisateur est médecin, utiliser DoctorProviders
  if (currentUser?.role === "medecin") {
    return <DoctorProviders>{children}</DoctorProviders>;
  }

  // Par défaut, utiliser DoctorProviders (pour la compatibilité)
  return <DoctorProviders>{children}</DoctorProviders>;
};

export default StaffProviders;
