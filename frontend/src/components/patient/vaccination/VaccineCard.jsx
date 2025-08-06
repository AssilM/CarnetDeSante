import React from "react";
import {
  FaSyringe,
  FaThumbtack,
  FaTrash,
} from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/fr";

/**
 * Composant de carte spécialisée pour les vaccins avec fonctionnalité de suppression
 */
const VaccineCard = ({
  title,
  date,
  subtitle,
  onViewDetails,
  onDelete,
  detailsText = "Aperçu",
  pinned = false,
  onTogglePin,
  statut,
}) => {
  // Format date FR
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    // Si la date est déjà au format français (DD/MM/YYYY), on la retourne telle quelle
    if (dateStr.includes("/")) {
      return dateStr;
    }

    // Sinon, on essaie de la formater avec dayjs
    try {
      return dayjs(dateStr).locale("fr").format("DD/MM/YYYY");
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return dateStr; // Retourner la chaîne originale si le formatage échoue
    }
  };

  // Badge statut vaccin
  const renderStatutBadge = () => {
    if (!statut) return null;

    const color =
      statut === "effectué"
        ? "bg-green-100 text-green-700 border-green-300"
        : "bg-orange-100 text-orange-700 border-orange-300";
    const label = statut === "effectué" ? "Effectué" : "À faire";
    return (
      <span
        className={`inline-block border px-2 py-0.5 rounded text-xs font-semibold ml-2 ${color}`}
      >
        {label}
      </span>
    );
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaSyringe className="text-xl text-blue-600" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-gray-900">
              {title}
              {renderStatutBadge()}
            </h3>
            <p className="text-sm text-gray-500">{formatDate(date)}</p>
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
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Supprimer ce vaccin"
            >
              <FaTrash className="text-sm" />
            </button>
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

export default VaccineCard; 