import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
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

  // Fonction pour afficher une notification - MÉMOISÉE
  const showNotification = useCallback(({
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
  }, []); // ✅ Dépendances vides pour éviter la recréation

  // Fonction pour fermer la notification - MÉMOISÉE
  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Fonction pour afficher une notification de succès avec rafraîchissement optionnel - MÉMOISÉE
  const showSuccess = useCallback((message, refresh = false) => {
    showNotification({ type: "success", message });
    if (refresh) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [showNotification]);

  // Fonction pour afficher une notification d'erreur - MÉMOISÉE
  const showError = useCallback((message) => {
    showNotification({ type: "error", message });
  }, [showNotification]);

  // Valeur du contexte mémorisée
  const contextValue = useMemo(() => ({
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
  }), [
    currentUser?.role,
    isDoctor,
    isPatient,
    isAdmin,
    isMobileMenuOpen,
    isSidebarExpanded,
    notification,
    showNotification,
    closeNotification,
    showSuccess,
    showError,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
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
