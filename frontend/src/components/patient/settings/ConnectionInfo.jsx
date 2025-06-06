import React from "react";
import { useNavigate } from "react-router-dom";
import { HiLockClosed } from "react-icons/hi";
import { FiMail, FiPhone } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";

const ConnectionInfo = () => {
  const navigate = useNavigate();
  const { fullName, username, email, phone } = useUserContext();

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        Informations de connexion
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Les informations de connexion de Mon espace santé sont les mêmes pour
        tous les profils rattachés à {fullName}.
      </p>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">
            Identifiant et mot de passe
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <HiLockClosed className="text-lg sm:text-xl text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium">Identifiant</div>
                <div className="text-gray-600 truncate">{username}</div>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <HiLockClosed className="text-lg sm:text-xl text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium">Mot de passe</div>
                  <div className="text-gray-600">••••••••••</div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-password")}
                className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">
            Coordonnées de contact
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <FiMail className="text-lg sm:text-xl text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium">Adresse e-mail</div>
                  <div className="text-gray-600 truncate">{email}</div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-email")}
                className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
              >
                Modifier
              </button>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <FiPhone className="text-lg sm:text-xl text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium">Numéro de téléphone mobile</div>
                  <div className="text-gray-600 truncate">{phone}</div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-phone")}
                className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionInfo;
