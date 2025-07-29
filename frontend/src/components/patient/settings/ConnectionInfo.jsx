
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiLockClosed } from "react-icons/hi";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";
import { useUserPhoto } from "../../../hooks";

const ConnectionInfo = () => {
  const navigate = useNavigate();
  const { user, loading, updateUserPhoto } = useUserContext();
  const { getPhotoUrl, getDefaultPhotoUrl } = useUserPhoto();
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef();
  const [photoError, setPhotoError] = useState("");

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

  // Formatage du numéro de téléphone avec indicatif
  const formatPhoneNumber = () => {
    if (!user.telIndicatif && !user.telNumero) return "Non renseigné";
    const indicatif = user.telIndicatif || "";
    const numero = user.telNumero || "";
    if (indicatif && numero) {
      return `${indicatif} ${numero}`;
    } else if (numero) {
      return numero;
    } else if (indicatif) {
      return indicatif;
    }
    return "Non renseigné";
  };

  // Handler pour le changement de photo de profil
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoError("");
    setPhotoLoading(true);
    try {
      if (typeof updateUserPhoto !== "function") {
        throw new Error("La fonction updateUserPhoto n'est pas disponible dans le contexte utilisateur.");
      }
      await updateUserPhoto(user.id, file);
    } catch (err) {
      setPhotoError(err.message || "Erreur lors de la mise à jour de la photo de profil.");
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div>
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
                    {formatPhoneNumber()}
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

        <div className="bg-white rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">
            Photo de profil
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.chemin_photo ? getPhotoUrl(user.chemin_photo) : getDefaultPhotoUrl(`${user.prenom} ${user.nom}`)}
              alt="Photo de profil"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <button
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => fileInputRef.current.click()}
              disabled={photoLoading}
            >
              {photoLoading ? "Chargement..." : "Modifier la photo de profil"}
            </button>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          {photoError && (
            <div className="text-red-600 mt-2 text-sm">{photoError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionInfo;
