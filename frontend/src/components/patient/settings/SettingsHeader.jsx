import React from "react";
import { FiSettings } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";

const SettingsHeader = () => {
  const { fullName } = useUserContext();

  return (
    <div className="flex items-start gap-6 mt-5 bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex-shrink-0">
        <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center">
          <FiSettings className="w-12 h-12 text-primary" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Paramètres de {fullName}
        </h1>
        <p className="text-gray-600">
          Je peux modifier les informations de mon profil et de mes profils
          rattachés. Je peux suivre l'historique d'activité, gérer mes
          notifications e-mail et clôturer mon compte.
        </p>
      </div>
    </div>
  );
};

export default SettingsHeader;
