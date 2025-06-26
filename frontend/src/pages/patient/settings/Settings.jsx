import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiChevronDown } from "react-icons/hi";
import SettingsSidebar from "../../../components/patient/settings/SettingsSidebar";
import SettingsHeader from "../../../components/patient/settings/SettingsHeader";
import ConnectionInfo from "../../../components/patient/settings/ConnectionInfo";
import Confidentiality from "../../../components/patient/settings/Confidentiality";
import HistoryData from "../../../components/patient/settings/HistoryData";
import CloseProfile from "../../../components/patient/settings/CloseProfile";
import PageWrapper from "../../../components/PageWrapper";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash || "#connexion";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!location.hash) {
      navigate("/settings#connexion", { replace: true });
    }
  }, [location.hash, navigate]);

  const getSectionTitle = () => {
    switch (hash) {
      case "#connexion":
        return "Informations de connexion";
      case "#confidentialite":
        return "Confidentialité";
      case "#historique":
        return "Historique et données";
      case "#cloture":
        return "Clôture du profil";
      default:
        return "Informations de connexion";
    }
  };

  const renderSection = () => {
    switch (hash) {
      case "#connexion":
        return <ConnectionInfo />;
      case "#confidentialite":
        return <Confidentiality />;
      case "#historique":
        return <HistoryData />;
      case "#cloture":
        return <CloseProfile />;
      default:
        return <ConnectionInfo />;
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SettingsHeader />

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
          >
            <span className="font-medium">{getSectionTitle()}</span>
            <HiChevronDown
              className={`text-xl transition-transform ${
                isMobileMenuOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isMobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
              <SettingsSidebar
                mobile={true}
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <SettingsSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-grow bg-white lg:bg-transparent rounded-lg lg:rounded-none shadow-sm lg:shadow-none p-4 lg:p-0">
            {renderSection()}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
