import React from "react";
import { Routes, Route } from "react-router-dom";

// Providers
import {
  AppProvider,
  UserProvider,
  DocumentProvider,
  VaccinationProvider,
  MedicalInfoProvider,
  MedicalHistoryProvider,
  AllergyProvider,
  HealthEventProvider,
} from "./context";

// Layout Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { ScrollToTop } from "./components/patient/common";

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

const USER_TYPES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

const App = () => {
  // Changez cette valeur pour tester les différents rôles
  const userType = USER_TYPES.PATIENT;

  // Fonction pour afficher le bon composant selon le rôle
  const getHomeComponent = () => {
    switch (userType) {
      case USER_TYPES.PATIENT:
        return <HomePatient />;
      case USER_TYPES.DOCTOR:
        return <HomeDoctor />;
      case USER_TYPES.ADMIN:
        return <HomeAdmin />;
      default:
        return <HomePatient />;
    }
  };

  return (
    <AppProvider>
      <UserProvider>
        <VaccinationProvider>
          <DocumentProvider>
            <MedicalInfoProvider>
              <MedicalHistoryProvider>
                <AllergyProvider>
                  <HealthEventProvider>
                    <div className="min-h-screen flex flex-col bg-gray-50">
                      <ScrollToTop />
                      <Navbar />
                      <div className="flex-1 flex">
                        <Sidebar />
                        <main className="flex-1 w-full min-h-[calc(100vh-4rem)] mt-16">
                          <Routes>
                            <Route path="/home" element={getHomeComponent()} />
                            <Route
                              path="/medical-profile"
                              element={<MedicalProfile />}
                            />
                            {/* Routes du profil médical */}
                            <Route
                              path="/medical-profile/edit"
                              element={<EditMedicalInfo />}
                            />
                            <Route
                              path="/medical-profile/history"
                              element={<MedicalHistoryList />}
                            />
                            <Route
                              path="/medical-profile/history/add"
                              element={<AddMedicalHistory />}
                            />
                            <Route
                              path="/medical-profile/history/details"
                              element={<MedicalHistoryDetails />}
                            />
                            <Route
                              path="/medical-profile/allergies"
                              element={<AllergyList />}
                            />
                            <Route
                              path="/medical-profile/allergies/add"
                              element={<AddAllergy />}
                            />
                            <Route
                              path="/medical-profile/allergies/details"
                              element={<AllergyDetails />}
                            />
                            <Route
                              path="/medical-profile/details"
                              element={<HealthEventDetails />}
                            />

                            <Route path="/documents" element={<Documents />} />
                            <Route
                              path="/documents/details"
                              element={<DocumentDetails />}
                            />
                            <Route
                              path="/vaccination"
                              element={<Vaccination />}
                            />
                            <Route
                              path="/vaccination/details"
                              element={<VaccineDetails />}
                            />
                            <Route path="/settings" element={<Settings />} />
                            <Route
                              path="/settings/edit-email"
                              element={<EditEmail />}
                            />
                            <Route
                              path="/settings/edit-phone"
                              element={<EditPhone />}
                            />
                            <Route
                              path="/settings/edit-password"
                              element={<EditPassword />}
                            />
                          </Routes>
                        </main>
                      </div>
                      <Footer />
                    </div>
                  </HealthEventProvider>
                </AllergyProvider>
              </MedicalHistoryProvider>
            </MedicalInfoProvider>
          </DocumentProvider>
        </VaccinationProvider>
      </UserProvider>
    </AppProvider>
  );
};

export default App;
