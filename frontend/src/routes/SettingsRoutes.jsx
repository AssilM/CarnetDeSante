import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages de paramètres
import Settings from "../pages/patient/settings/Settings";
import EditEmail from "../pages/patient/settings/EditEmail";
import EditPhone from "../pages/patient/settings/EditPhone";
import EditPassword from "../pages/patient/settings/EditPassword";
import EditAddress from "../pages/patient/settings/EditAddress";

const SettingsRoutes = () => {
  return (
    <>
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/edit-email"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <EditEmail />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/edit-phone"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <EditPhone />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/edit-password"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <EditPassword />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/edit-address"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <EditAddress />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default SettingsRoutes;
