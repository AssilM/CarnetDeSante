import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { UserProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import HomePatient from "./pages/patient/HomePatient";
import HomeDoctor from "./pages/doctor/HomeDoctor";
import HomeAdmin from "./pages/admin/HomeAdmin";
import MedicalProfile from "./pages/patient/MedicalProfile";
import Settings from "./pages/patient/settings/Settings";
import EditEmail from "./pages/patient/settings/EditEmail";
import EditPhone from "./pages/patient/settings/EditPhone";
import EditPassword from "./pages/patient/settings/EditPassword";
import Documents from "./pages/patient/Documents";
import Vaccination from "./pages/patient/Vaccination";

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
        <div className="min-h-screen flex flex-col bg-gray-50">
          <ScrollToTop />
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar />
            <main className="flex-1 w-full min-h-[calc(100vh-4rem)] mt-16">
              <Routes>
                <Route path="/" element={getHomeComponent()} />
                <Route path="/medical-profile" element={<MedicalProfile />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/vaccination" element={<Vaccination />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/edit-email" element={<EditEmail />} />
                <Route path="/settings/edit-phone" element={<EditPhone />} />
                <Route
                  path="/settings/edit-password"
                  element={<EditPassword />}
                />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </UserProvider>
    </AppProvider>
  );
};

export default App;
