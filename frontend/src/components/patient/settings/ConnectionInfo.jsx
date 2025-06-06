import React from "react";
import { useNavigate } from "react-router-dom";
import { HiLockClosed } from "react-icons/hi";
import { FiMail, FiPhone } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";

const IdentityField = ({ label, value, icon: Icon }) => (
  <div className="bg-white rounded-lg p-6 mb-4">
    <h3 className="text-lg font-medium mb-4">{label}</h3>
    <div className="flex items-center gap-3">
      <Icon className="text-xl text-gray-500" />
      <span className="text-gray-700">{value}</span>
    </div>
  </div>
);

const ConnectionInfo = () => {
  const navigate = useNavigate();
  const { fullName, username, email, phone } = useUserContext();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Informations de connexion</h2>
      <p className="text-gray-600 mb-6">
        Les informations de connexion de Mon espace santé sont les mêmes pour
        tous les profils rattachés à {fullName}.
      </p>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">
            Identifiant et mot de passe
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <HiLockClosed className="text-xl text-gray-500" />
              <div>
                <div className="font-medium">Identifiant</div>
                <div className="text-gray-600">{username}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiLockClosed className="text-xl text-gray-500" />
                <div>
                  <div className="font-medium">Mot de passe</div>
                  <div className="text-gray-600">••••••••••</div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-password")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Coordonnées de contact</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiMail className="text-xl text-gray-500" />
                <div>
                  <div className="font-medium">Adresse e-mail</div>
                  <div className="text-gray-600">{email}</div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-email")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Modifier
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiPhone className="text-xl text-gray-500" />
                <div>
                  <div className="font-medium">Numéro de téléphone mobile</div>
                  <div className="text-gray-600">{phone}</div>
                </div>
              </div>
              <button
                onClick={() => navigate("/settings/edit-phone")}
                className="text-blue-600 hover:text-blue-700 font-medium"
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
