import React from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthContext";

const WelcomeCard = () => {
  const { user } = useUserContext();
  const { currentUser } = useAuth();

  // Récupérer le prénom et le nom de l'utilisateur
  const firstName = user?.firstName || currentUser?.prenom || "";
  const lastName = user?.lastName || currentUser?.nom || "";
  const fullName =
    firstName && lastName ? `${firstName} ${lastName}` : "Utilisateur";

  return (
    <div className="text-white relative flex justify-between items-center">
      <div className="space-y-2">
        <div>
          <h2 className="text-2xl font-bold">Bienvenue {fullName} ! 👋</h2>
          <p className="text-white/90">C'est un plaisir de vous revoir</p>
        </div>
        <div>
          <p className="text-base mb-4">
            Envie de découvrir'actualité ou lire des articles de préventions
          </p>
        </div>
      </div>
      <div className="w-24 h-24 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
          <circle cx="50" cy="50" r="50" fill="currentColor" />
          <circle cx="50" cy="35" r="20" fill="#fff" />
          <path
            d="M50 60 C 30 60, 20 80, 20 100 L 80 100 C 80 80, 70 60, 50 60"
            fill="#fff"
          />
        </svg>
      </div>
    </div>
  );
};

export default WelcomeCard;
