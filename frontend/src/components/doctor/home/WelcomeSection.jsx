import React from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useAuth } from "../../../context";
import { useUserPhoto } from "../../../hooks/useUserPhoto";

const WelcomeSection = ({ currentDateTime }) => {
  const { currentUser } = useAuth();
  const { getCurrentUserPhotoUrl, getCurrentUserDefaultPhotoUrl } = useUserPhoto();

  // Récupérer l'URL de la photo de profil
  const photoUrl = getCurrentUserPhotoUrl() || getCurrentUserDefaultPhotoUrl();

  return (
    <div className="bg-gradient-to-r from-[#E8F4FD] to-white rounded-lg relative overflow-hidden p-6 shadow-sm border border-[#E9ECEF] transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#343A40] mb-1">
            Bonjour, Dr. {currentUser?.nom} {currentUser?.prenom}
          </h1>
          <p className="text-[#6C757D] text-base mb-3">
            {currentUser?.specialite}
          </p>
          {/* Date & heure courantes */}
          <div className="flex items-center text-sm text-[#6C757D] space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-1 text-[#4A90E2]" />
              <span>
                {currentDateTime.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-1 text-[#4A90E2]" />
              <span>
                {currentDateTime.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-[#E8F4FD] rounded-full p-2 flex-shrink-0 relative z-10">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`Photo de profil de Dr. ${currentUser?.prenom} ${currentUser?.nom}`}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => {
                // En cas d'erreur de chargement, utiliser l'URL par défaut
                e.target.src = getCurrentUserDefaultPhotoUrl();
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#4A90E2] flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {currentUser?.prenom?.charAt(0)?.toUpperCase() || "D"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
