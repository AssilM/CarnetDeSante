import React from "react";
import { FaFileAlt, FaSyringe } from "react-icons/fa";

/**
 * Composant de carte réutilisable pour afficher un élément (document ou vaccin)
 * @param {string} type - Type d'élément ('document' ou 'vaccine')
 * @param {string} title - Titre principal
 * @param {string} date - Date de l'élément
 * @param {string} subtitle - Sous-titre ou description
 * @param {Function} onViewDetails - Fonction appelée pour voir les détails
 */
const ItemCard = ({ type, title, date, subtitle, onViewDetails }) => {
  const Icon = type === "document" ? FaFileAlt : FaSyringe;
  const bgColor = type === "document" ? "bg-secondary" : "bg-purple-100";
  const iconColor = type === "document" ? "text-primary" : "text-purple-600";

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`text-xl ${iconColor}`} />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{date}</p>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onViewDetails}
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            Aperçu ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
