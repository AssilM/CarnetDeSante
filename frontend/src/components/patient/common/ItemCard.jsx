import React from "react";
import {
  FaFileAlt,
  FaSyringe,
  FaHistory,
  FaAllergies,
  FaThumbtack,
} from "react-icons/fa";

/**
 * Composant de carte réutilisable pour afficher un élément (document, vaccin, antécédent ou allergie)
 * @param {string} type - Type d'élément ('document', 'vaccine', 'history' ou 'allergy')
 * @param {string} title - Titre principal
 * @param {string} date - Date de l'élément
 * @param {string} subtitle - Sous-titre ou description
 * @param {Function} onViewDetails - Fonction appelée pour voir les détails
 * @param {string} detailsText - Texte du bouton de détails (par défaut: "Aperçu")
 * @param {boolean} pinned - Indique si l'élément est épinglé
 * @param {Function} onTogglePin - Fonction appelée pour épingler/désépingler
 */
const ItemCard = ({
  type,
  title,
  date,
  subtitle,
  onViewDetails,
  detailsText = "Aperçu",
  pinned = false,
  onTogglePin,
}) => {
  // Détermine l'icône en fonction du type
  const getIcon = () => {
    switch (type) {
      case "document":
        return FaFileAlt;
      case "vaccine":
        return FaSyringe;
      case "history":
        return FaHistory;
      case "allergy":
        return FaAllergies;
      default:
        return FaFileAlt;
    }
  };

  // Détermine les couleurs en fonction du type, pour les cercles à côté
  const getColors = () => {
    switch (type) {
      case "document":
        return { bg: "bg-secondary", text: "text-primary" };
      case "vaccine":
        return { bg: "bg-purple-100", text: "text-purple-600" };
      case "history":
        return { bg: "bg-blue-100", text: "text-blue-600" };
      case "allergy":
        return { bg: "bg-red-100", text: "text-red-600" };
      case "event":
        return { bg: "bg-secondary", text: "text-primary" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin();
    }
  };

  const Icon = getIcon();
  const { bg, text } = getColors();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`text-xl ${text}`} />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{date}</p>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onTogglePin && (
              <button
                onClick={handleTogglePin}
                className={`p-2 rounded-full transition-colors ${
                  pinned
                    ? "text-amber-500 hover:text-amber-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title={pinned ? "Désépingler" : "Épingler"}
              >
                <FaThumbtack
                  className={`text-lg ${pinned ? "rotate-0" : "rotate-45"}`}
                />
              </button>
            )}
            <button
              onClick={onViewDetails}
              className="text-sm text-primary hover:text-primary/80"
            >
              {detailsText} ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
