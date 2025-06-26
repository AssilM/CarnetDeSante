import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages du profil médical
import EditMedicalInfo from "../pages/patient/medical/EditMedicalInfo";
import MedicalHistoryList from "../pages/patient/medical/MedicalHistoryList";
import MedicalHistoryDetails from "../pages/patient/medical/MedicalHistoryDetails";
import AddMedicalHistory from "../pages/patient/medical/AddMedicalHistory";
import AllergyList from "../pages/patient/medical/AllergyList";
import AllergyDetails from "../pages/patient/medical/AllergyDetails";
import AddAllergy from "../pages/patient/medical/AddAllergy";
import HealthEventList from "../pages/patient/medical/HealthEventList";
import HealthEventDetails from "../pages/patient/medical/HealthEventDetails";

const MedicalRoutes = () => {
  return (
    <>
      <Route
        path="/medical-profile/edit"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <EditMedicalInfo />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-profile/history"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <MedicalHistoryList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-profile/history/add"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <AddMedicalHistory />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-profile/history/details"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <MedicalHistoryDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-profile/allergies"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <AllergyList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-profile/allergies/add"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <AddAllergy />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-profile/allergies/details"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <AllergyDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-profile/details"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <HealthEventDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default MedicalRoutes;
