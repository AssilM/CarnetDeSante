import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  useEffect(() => {
    if (!location.hash) {
      navigate("/settings#connexion", { replace: true });
    }
  }, [location.hash, navigate]);

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
      <div className="max-w-7xl mx-auto p-6">
        <SettingsHeader />
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <SettingsSidebar />
          </div>
          <div className="flex-grow">{renderSection()}</div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
