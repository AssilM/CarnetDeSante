import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages pour le personnel médical et administratif
import HomeDoctor from "../pages/doctor/HomeDoctor";
import Agenda from "../pages/doctor/Agenda";
import HomeAdmin from "../pages/admin/HomeAdmin";
import Availability from "../pages/doctor/Availability";

/**
 * Routes pour le personnel médical et administratif
 * Exporte un tableau de routes pour les médecins et administrateurs
 * À étendre avec les nouvelles fonctionnalités pour ces rôles
 */
const StaffRoutes = [
  // Routes pour les médecins
  <Route
    key="doctor-home"
    path="/doctor/home"
    element={
      <ProtectedRoute requiredRole="medecin">
        <MainLayout>
          <HomeDoctor />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="doctor-agenda"
    path="/doctor/agenda"
    element={
      <ProtectedRoute requiredRole="medecin">
        <MainLayout>
          <Agenda />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="doctor-availability"
    path="/doctor/availability"
    element={
      <ProtectedRoute requiredRole="medecin">
        <MainLayout>
          <Availability />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Routes pour les administrateurs
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
];

export default StaffRoutes;
