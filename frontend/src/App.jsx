import React from "react";
import { Routes, Route } from "react-router-dom";

// Providers
import {
  AuthProvider,
  AppProvider,
  UserProvider,
  DocumentProvider,
  VaccinationProvider,
  MedicalInfoProvider,
  MedicalHistoryProvider,
  AllergyProvider,
  HealthEventProvider,
  AppointmentProvider,
  DoctorProvider,
} from "./context";

// Layout Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { ScrollToTop } from "./components/patient/common";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Auth Pages
import LandingPage from "./pages/auth/LandingPage";
import RoleSelectPage from "./pages/auth/RoleSelectPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SessionExpired from "./pages/SessionExpired";

// Pages - Home
import HomePatient from "./pages/patient/HomePatient";
import HomeDoctor from "./pages/doctor/HomeDoctor";
import HomeAdmin from "./pages/admin/HomeAdmin";

// Pages - Patient
import MedicalProfile from "./pages/patient/MedicalProfile";
import Documents from "./pages/patient/documents/Documents";
import DocumentDetails from "./pages/patient/documents/DocumentDetails";
import Vaccination from "./pages/patient/vaccination/Vaccination";
import VaccineDetails from "./pages/patient/vaccination/VaccineDetails";

// Pages - Medical Profile
import EditMedicalInfo from "./pages/patient/medical/EditMedicalInfo";
import MedicalHistoryList from "./pages/patient/medical/MedicalHistoryList";
import MedicalHistoryDetails from "./pages/patient/medical/MedicalHistoryDetails";
import AddMedicalHistory from "./pages/patient/medical/AddMedicalHistory";
import AllergyList from "./pages/patient/medical/AllergyList";
import AllergyDetails from "./pages/patient/medical/AllergyDetails";
import AddAllergy from "./pages/patient/medical/AddAllergy";
import HealthEventList from "./pages/patient/medical/HealthEventList";
import HealthEventDetails from "./pages/patient/medical/HealthEventDetails";

// Pages - Settings
import Settings from "./pages/patient/settings/Settings";
import EditEmail from "./pages/patient/settings/EditEmail";
import EditPhone from "./pages/patient/settings/EditPhone";
import EditPassword from "./pages/patient/settings/EditPassword";
import EditAddress from "./pages/patient/settings/EditAddress";

// Pages - Appointments
import Appointments from "./pages/patient/appointments/Appointments";
import AppointmentDetails from "./pages/patient/appointments/AppointmentDetails";
import BookAppointment from "./pages/patient/appointments/BookAppointment";
import DoctorSelection from "./pages/patient/appointments/DoctorSelection";
import SlotSelection from "./pages/patient/appointments/SlotSelection";
import AppointmentConfirmation from "./pages/patient/appointments/AppointmentConfirmation";

const App = () => {
  // Layout pour les pages d'authentification (sans Navbar ni Sidebar)
  const AuthLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-gray-50">{children}</div>
  );

  // Layout pour les pages principales (avec Navbar et Sidebar)
  const MainLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 w-full min-h-[calc(100vh-4rem)] mt-16">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );

  return (
    <AuthProvider>
      <AppProvider>
        <UserProvider>
          <VaccinationProvider>
            <DocumentProvider>
              <MedicalInfoProvider>
                <MedicalHistoryProvider>
                  <AllergyProvider>
                    <HealthEventProvider>
                      <AppointmentProvider>
                        <DoctorProvider>
                          <Routes>
                            {/* Routes d'authentification sans Navbar/Sidebar */}
                            <Route path="/" element={<LandingPage />} />
                            <Route
                              path="/auth/role-select"
                              element={<RoleSelectPage />}
                            />
                            <Route path="/auth/login" element={<LoginPage />} />
                            <Route
                              path="/auth/register"
                              element={<RegisterPage />}
                            />
                            <Route
                              path="/session-expired"
                              element={<SessionExpired />}
                            />

                            {/* Routes principales avec Navbar/Sidebar */}
                            <Route
                              path="/home"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <HomePatient />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />

                            {/* Routes spécifiques par rôle */}
                            <Route
                              path="/patient/home"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <HomePatient />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/doctor/home"
                              element={
                                <ProtectedRoute requiredRole="medecin">
                                  <MainLayout>
                                    <HomeDoctor />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/admin/home"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <MainLayout>
                                    <HomeAdmin />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />

                            {/* Routes patient */}
                            <Route
                              path="/medical-profile"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <MedicalProfile />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />

                            {/* Routes du profil médical */}
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

                            <Route
                              path="/documents"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <Documents />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/documents/details"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <DocumentDetails />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/vaccination"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <Vaccination />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/vaccination/details"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <VaccineDetails />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <Settings />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/settings/edit-email"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <EditEmail />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/settings/edit-phone"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <EditPhone />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/settings/edit-password"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <EditPassword />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/settings/edit-address"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <EditAddress />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />

                            {/* Routes des rendez-vous */}
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
                            <Route
                              path="/appointments/book"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <BookAppointment />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/appointments/book/doctor"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <DoctorSelection />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/appointments/book/slot"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <SlotSelection />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/appointments/confirmation"
                              element={
                                <ProtectedRoute requiredRole="patient">
                                  <MainLayout>
                                    <AppointmentConfirmation />
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                          </Routes>
                        </DoctorProvider>
                      </AppointmentProvider>
                    </HealthEventProvider>
                  </AllergyProvider>
                </MedicalHistoryProvider>
              </MedicalInfoProvider>
            </DocumentProvider>
          </VaccinationProvider>
        </UserProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
