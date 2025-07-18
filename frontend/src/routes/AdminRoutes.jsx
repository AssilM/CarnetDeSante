import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages administrateur
import HomeAdmin from "../pages/admin/HomeAdmin";
import Statistics from "../pages/admin/Statistics";
import Users from "../pages/admin/Users";
import Documents from "../pages/admin/Documents";

/**
 * Routes spécifiques aux administrateurs
 * Contient toutes les routes nécessaires pour les administrateurs
 */
const AdminRoutes = [
  // Route d'accueil administrateur
  <Route
    key="admin-home"
    path="/admin/home"
    element={
      <ProtectedRoute requiredRole="admin">
        <MainLayout>
          <HomeAdmin />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Route des statistiques administrateur
  <Route
    key="admin-stats"
    path="/admin/stats"
    element={
      <ProtectedRoute requiredRole="admin">
        <MainLayout>
          <Statistics />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Route de gestion des utilisateurs
  <Route
    key="admin-users"
    path="/admin/users"
    element={
      <ProtectedRoute requiredRole="admin">
        <MainLayout>
          <Users />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Route de gestion des documents
  <Route
    key="admin-documents"
    path="/admin/documents"
    element={
      <ProtectedRoute requiredRole="admin">
        <MainLayout>
          <Documents />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Route par défaut pour /admin (redirige vers /admin/home)
  <Route
    key="admin-default"
    path="/admin"
    element={
      <ProtectedRoute requiredRole="admin">
        <MainLayout>
          <HomeAdmin />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
];

export default AdminRoutes;
