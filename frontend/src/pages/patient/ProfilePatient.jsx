import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileSidebar from "../../components/patient/home/ProfileSidebar";
import ProfileHeader from "../../components/patient/profile/ProfileHeader";
import ConnectionInfo from "../../components/patient/profile/ConnectionInfo";
import Confidentiality from "../../components/patient/profile/Confidentiality";
import HistoryData from "../../components/patient/profile/HistoryData";
import CloseProfile from "../../components/patient/profile/CloseProfile";
import PageWrapper from "../../components/PageWrapper";

const ProfilePatient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash || "#connexion";

  useEffect(() => {
    if (!location.hash) {
      navigate("/profile-patient#connexion", { replace: true });
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
        <ProfileHeader />
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <ProfileSidebar />
          </div>
          <div className="flex-grow">{renderSection()}</div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePatient;
