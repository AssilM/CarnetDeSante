import React from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthContext";
import { useUserPhoto } from "../../../hooks";

const WelcomeCard = () => {
  const { user } = useUserContext();
  const { currentUser } = useAuth();
  const { getCurrentUserPhotoUrl, getCurrentUserDefaultPhotoUrl } = useUserPhoto();

  // Récupérer le prénom et le nom de l'utilisateur
  const firstName = user?.firstName || currentUser?.prenom || "";
  const lastName = user?.lastName || currentUser?.nom || "";
  const fullName =
    firstName && lastName ? `${firstName} ${lastName}` : "Utilisateur";

  return (

    <div className="text-white relative flex justify-between items-center rounded-lg overflow-hidden bg-blue-600 p-4 md:p-8">

      <div className="space-y-2 w-full">
        <div>
          <h2 className="text-2xl font-bold">Bienvenue {fullName} ! 👋</h2>
          <p className="text-white/90">C'est un plaisir de vous revoir</p>
        </div>
      </div>
      <div className="flex items-center justify-center" style={{ minWidth: '6rem', minHeight: '6rem', width: '6rem', height: '6rem', borderRadius: '9999px', background: 'transparent' }}>
        {currentUser?.chemin_photo && currentUser.chemin_photo.trim() !== "" ? (
          <img
            src={getCurrentUserPhotoUrl()}
            alt="Photo de profil"
            className="w-full h-full rounded-full object-cover border"
            style={{ minWidth: '6rem', minHeight: '6rem', width: '6rem', height: '6rem', borderRadius: '9999px' }}
            onError={e => { e.target.onerror = null; e.target.src = getCurrentUserDefaultPhotoUrl(); }}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg"
            style={{ minWidth: '6rem', minHeight: '6rem', width: '6rem', height: '6rem', borderRadius: '9999px' }}>
            {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;
