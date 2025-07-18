import React, { createContext, useContext, useState, useEffect } from "react";
import { adminService } from "../services/api";
import { useAuth } from "./AuthContext";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin doit être utilisé dans un AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const loadDashboardStats = async () => {
    // Vérifier que l'utilisateur est admin avant de charger les stats
    if (!currentUser || currentUser.role !== "admin") {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
      setError("Impossible de charger les statistiques du tableau de bord");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    loadDashboardStats();
  };

  useEffect(() => {
    // Ne charger les stats que si l'utilisateur est admin
    if (currentUser && currentUser.role === "admin") {
      loadDashboardStats();
    } else {
      // Réinitialiser les stats si l'utilisateur n'est pas admin
      setStats(null);
      setLoading(false);
      setError(null);
    }
  }, [currentUser]);

  const value = {
    stats,
    loading,
    error,
    activeTab,
    setActiveTab,
    loadDashboardStats,
    refreshStats,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
