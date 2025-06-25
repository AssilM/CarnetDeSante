import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Fonctions utilitaires pour vérifier le rôle
  const isDoctor = currentUser?.role === "medecin";
  const isPatient = currentUser?.role === "patient";
  const isAdmin = currentUser?.role === "admin";

  return (
    <AppContext.Provider
      value={{
        userRole: currentUser?.role,
        isDoctor,
        isPatient,
        isAdmin,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSidebarExpanded,
        setIsSidebarExpanded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
