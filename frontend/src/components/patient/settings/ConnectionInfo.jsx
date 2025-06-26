import React from "react";
import { useNavigate } from "react-router-dom";
import { HiLockClosed } from "react-icons/hi";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";

const ConnectionInfo = () => {
  const navigate = useNavigate();
  const { user, loading } = useUserContext();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        Impossible de charger les informations de connexion.
      </div>
    );
  }

  // Formatage de l'adresse complète
  const formatFullAddress = () => {
    const parts = [];
    if (user.adresse) parts.push(user.adresse);
    if (user.codePostal) parts.push(user.codePostal);
    if (user.ville) parts.push(user.ville);

    return parts.length > 0 ? parts.join(", ") : "Non renseignée";
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        Informations de connexion
      </h2>

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
                <div className="text-gray-600 truncate">{user.username}</div>
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
                  <div className="text-gray-600 truncate">{user.email}</div>
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
                  <div className="font-medium">Numéro de téléphone</div>
                  <div className="text-gray-600 truncate">
                    {user.phone || "Non renseigné"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-phone")}
                className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
              >
                Modifier
              </button>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-lg sm:text-xl text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium">Adresse</div>
                  <div className="text-gray-600 truncate">
                    {formatFullAddress()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-address")}
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
