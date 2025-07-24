import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import ConnectionInfo from "../../../components/patient/settings/ConnectionInfo";
import PageWrapper from "../../../components/PageWrapper";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.hash || location.hash !== "#connexion") {
      navigate("/settings#connexion", { replace: true });
    }
  }, [location.hash, navigate]);

  return (
    <PageWrapper className="min-h-screen bg-gray-50">
      {/* En-tête de la page avec icône et titre */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <FaCog className="text-2xl text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Paramètres
              </h1>
              <p className="text-sm text-gray-600">
                Gérez vos informations personnelles et vos préférences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <ConnectionInfo />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
