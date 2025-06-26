import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fonctions utilitaires pour vérifier le rôle
  const isDoctor = currentUser?.role === "medecin";
  const isPatient = currentUser?.role === "patient";
  const isAdmin = currentUser?.role === "admin";

  // Fonction pour afficher une notification
  const showNotification = ({
    type,
    message,
    autoClose = true,
    duration = 3000,
  }) => {
    setNotification({ type, message, autoClose });

    // Si autoClose est activé, fermer automatiquement après la durée spécifiée
    if (autoClose) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  };

  // Fonction pour fermer la notification
  const closeNotification = () => {
    setNotification(null);
  };

  // Fonction pour afficher une notification de succès avec rafraîchissement optionnel
  const showSuccess = (message, refresh = false) => {
    showNotification({ type: "success", message });
    if (refresh) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  // Fonction pour afficher une notification d'erreur
  const showError = (message) => {
    showNotification({ type: "error", message });
  };

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
        notification,
        showNotification,
        closeNotification,
        showSuccess,
        showError,
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
