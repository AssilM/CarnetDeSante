import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages patient - Home
import HomePatient from "../pages/patient/HomePatient";
import MedicalProfile from "../pages/patient/MedicalProfile";

// Pages - Documents
import Documents from "../pages/patient/documents/Documents";
import DocumentDetails from "../pages/patient/documents/DocumentDetails";

// Pages - Vaccination
import Vaccination from "../pages/patient/vaccination/Vaccination";
import VaccineDetails from "../pages/patient/vaccination/VaccineDetails";

// Pages - Medical
import EditMedicalInfo from "../pages/patient/medical/EditMedicalInfo";
import MedicalHistoryList from "../pages/patient/medical/MedicalHistoryList";
import MedicalHistoryDetails from "../pages/patient/medical/MedicalHistoryDetails";
import AddMedicalHistory from "../pages/patient/medical/AddMedicalHistory";
import AllergyList from "../pages/patient/medical/AllergyList";
import AllergyDetails from "../pages/patient/medical/AllergyDetails";
import AddAllergy from "../pages/patient/medical/AddAllergy";
import HealthEventList from "../pages/patient/medical/HealthEventList";
import HealthEventDetails from "../pages/patient/medical/HealthEventDetails";

// Pages - Settings
import Settings from "../pages/patient/settings/Settings";
import EditEmail from "../pages/patient/settings/EditEmail";
import EditPhone from "../pages/patient/settings/EditPhone";
import EditPassword from "../pages/patient/settings/EditPassword";
import EditAddress from "../pages/patient/settings/EditAddress";

// Pages - Appointments
import Appointments from "../pages/patient/appointments/Appointments";
import AppointmentDetails from "../pages/patient/appointments/AppointmentDetails";
import BookAppointment from "../pages/patient/appointments/BookAppointment";
import DoctorSelection from "../pages/patient/appointments/DoctorSelection";
import SlotSelection from "../pages/patient/appointments/SlotSelection";
import AppointmentConfirmation from "../pages/patient/appointments/AppointmentConfirmation";

/**
 * Routes pour les patients
 * Exporte un tableau de routes pour le rôle patient
 */
const PatientRoutes = [
  // Routes principales
  <Route
    key="patient-home"
    path="/patient/home"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <HomePatient />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="home"
    path="/home"
    element={
      <ProtectedRoute>
        <MainLayout>
          <HomePatient />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile"
    path="/medical-profile"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <MedicalProfile />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Routes des documents
  <Route
    key="documents"
    path="/documents"
    element={
      <ProtectedRoute>
        <MainLayout>
          <Documents />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="documents-details"
    path="/documents/details"
    element={
      <ProtectedRoute>
        <MainLayout>
          <DocumentDetails />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Routes de vaccination
  <Route
    key="vaccination"
    path="/vaccination"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <Vaccination />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="vaccination-details"
    path="/vaccination/details"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <VaccineDetails />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Routes du profil médical
  <Route
    key="medical-profile-edit"
    path="/medical-profile/edit"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <EditMedicalInfo />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile-history"
    path="/medical-profile/history"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <MedicalHistoryList />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile-history-add"
    path="/medical-profile/history/add"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <AddMedicalHistory />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile-history-details"
    path="/medical-profile/history/details"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <MedicalHistoryDetails />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile-allergies"
    path="/medical-profile/allergies"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <AllergyList />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile-allergies-add"
    path="/medical-profile/allergies/add"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <AddAllergy />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile-allergies-details"
    path="/medical-profile/allergies/details"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <AllergyDetails />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="medical-profile-details"
    path="/medical-profile/details"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <HealthEventDetails />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Routes de paramètres
  <Route
    key="settings"
    path="/settings"
    element={
      <ProtectedRoute>
        <MainLayout>
          <Settings />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings-edit-email"
    path="/settings/edit-email"
    element={
      <ProtectedRoute>
        <MainLayout>
          <EditEmail />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings-edit-phone"
    path="/settings/edit-phone"
    element={
      <ProtectedRoute>
        <MainLayout>
          <EditPhone />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings-edit-password"
    path="/settings/edit-password"
    element={
      <ProtectedRoute>
        <MainLayout>
          <EditPassword />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings-edit-address"
    path="/settings/edit-address"
    element={
      <ProtectedRoute>
        <MainLayout>
          <EditAddress />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Routes des rendez-vous
  <Route
    key="appointments"
    path="/appointments"
    element={
      <ProtectedRoute>
        <MainLayout>
          <Appointments />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="appointments-details"
    path="/appointments/details"
    element={
      <ProtectedRoute>
        <MainLayout>
          <AppointmentDetails />
        </MainLayout>
      </ProtectedRoute>
    }
  />,

  // Routes de prise de rendez-vous (séparées de /appointments)
  <Route
    key="book-appointment"
    path="/book-appointment"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <BookAppointment />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="book-appointment-doctor"
    path="/book-appointment/doctor"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <DoctorSelection />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="book-appointment-slot"
    path="/book-appointment/slot"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <SlotSelection />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="book-appointment-confirmation"
    path="/book-appointment/confirmation"
    element={
      <ProtectedRoute requiredRole="patient">
        <MainLayout>
          <AppointmentConfirmation />
        </MainLayout>
      </ProtectedRoute>
    }
  />,
];

export default PatientRoutes;
