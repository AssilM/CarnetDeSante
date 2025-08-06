import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages pour les médecins
import HomeDoctor from "../pages/doctor/HomeDoctor";
import Agenda from "../pages/doctor/Agenda";
import Availability from "../pages/doctor/Availability";
import PatientsList from "../pages/doctor/PatientsList";

// Pages - Notifications
import Notifications from "../pages/Notifications";

// Pages - Messagerie
import Messagerie from "../pages/messagerie/Messagerie";

/**
 * Routes spécifiques aux médecins
 * Contient toutes les routes nécessaires pour les médecins
 */
const DoctorRoutes = [
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

  <Route
    key="doctor-patients"
    path="/doctor/patient"
    element={
      <ProtectedRoute requiredRole="medecin">
        <MainLayout>
          <PatientsList />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Route par défaut pour /doctor (redirige vers /doctor/home)
  <Route
    key="doctor-default"
    path="/doctor"
    element={
      <ProtectedRoute requiredRole="medecin">
        <MainLayout>
          <HomeDoctor />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Route des notifications
  <Route
    key="notifications"
    path="/notifications"
    element={
      <ProtectedRoute>
        <MainLayout>
          <Notifications />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Route de la messagerie
  <Route
    key="messagerie"
    path="/messagerie"
    element={
      <ProtectedRoute>
        <MainLayout hideFooter={true}>
          <Messagerie />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
];

export default DoctorRoutes;
