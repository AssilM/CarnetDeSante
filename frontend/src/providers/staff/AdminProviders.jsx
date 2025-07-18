import React from "react";
import { AdminProvider } from "../../context";

/**
 * Providers spécifiques aux fonctionnalités des administrateurs
 * Contient les contextes nécessaires pour les administrateurs uniquement
 */
const AdminProviders = ({ children }) => {
  return <AdminProvider>{children}</AdminProvider>;
};

export default AdminProviders;
