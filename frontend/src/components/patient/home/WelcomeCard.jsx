import React from "react";
import { Link } from "react-router-dom";

const WelcomeCard = () => {
  return (
    <div className="text-white relative flex justify-between items-center">
      <div className="space-y-2">
        <div>
          <h2 className="text-2xl font-bold">Bienvenue Jean Dupont ! 👋</h2>
          <p className="text-white/90">C'est un plaisir de vous revoir</p>
        </div>
        <div>
          <p className="text-base mb-4">
            Envie de découvrir l'actualité ou lire des articles de préventions
          </p>
          <Link
            to="/articles"
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            En apprendre plus
          </Link>
        </div>
      </div>
      <div className="w-24 h-24 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full text-blue-800">
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
