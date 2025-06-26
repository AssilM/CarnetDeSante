import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages de rendez-vous
import Appointments from "../pages/patient/appointments/Appointments";
import AppointmentDetails from "../pages/patient/appointments/AppointmentDetails";
import BookAppointment from "../pages/patient/appointments/BookAppointment";
import DoctorSelection from "../pages/patient/appointments/DoctorSelection";
import SlotSelection from "../pages/patient/appointments/SlotSelection";
import AppointmentConfirmation from "../pages/patient/appointments/AppointmentConfirmation";

const AppointmentRoutes = () => {
  return (
    <>
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Appointments />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/details"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AppointmentDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Routes de prise de rendez-vous déplacées vers /book-appointment/* */}
      <Route
        path="/book-appointment"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <BookAppointment />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-appointment/doctor"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <DoctorSelection />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-appointment/slot"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <SlotSelection />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-appointment/confirmation"
        element={
          <ProtectedRoute requiredRole="patient">
            <MainLayout>
              <AppointmentConfirmation />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default AppointmentRoutes;
