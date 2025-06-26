import React from "react";
import { AppProvider, UserProvider, DoctorProvider } from "../../context";

/**
 * Providers de base nécessaires pour toutes les parties de l'application
 * N'inclut PAS AuthProvider qui doit être au niveau supérieur
 */
const BaseProviders = ({ children }) => {
  return (
    <AppProvider>
      <UserProvider>
        <DoctorProvider>{children}</DoctorProvider>
      </UserProvider>
    </AppProvider>
  );
};

export default BaseProviders;
