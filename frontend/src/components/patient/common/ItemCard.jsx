import React from "react";
import {
  FaFileAlt,
  FaSyringe,
  FaHistory,
  FaAllergies,
  FaThumbtack,
  FaCalendarAlt,
} from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/fr";

/**
 * Composant de carte réutilisable pour afficher un élément (document, vaccin, antécédent ou allergie)
 * @param {string} type - Type d'élément ('document', 'vaccine', 'history', 'allergy' ou 'appointment')
 * @param {string} title - Titre principal
 * @param {string} date - Date de l'élément
 * @param {string} subtitle - Sous-titre ou description
 * @param {Function} onViewDetails - Fonction appelée pour voir les détails
 * @param {string} detailsText - Texte du bouton de détails (par défaut: "Aperçu")
 * @param {boolean} pinned - Indique si l'élément est épinglé
 * @param {Function} onTogglePin - Fonction appelée pour épingler/désépingler
 * @param {string} statut - Statut de l'élément (optionnel)
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
  statut,
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
      case "appointment":
        return FaCalendarAlt;
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
      case "appointment":
        return { bg: "bg-green-100", text: "text-green-600" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

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

  // Badge statut vaccin ou rendez-vous
  const renderStatutBadge = () => {
    if (!statut) return null;

    // Pour les vaccins
    if (type === "vaccine") {
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
    }

    // Pour les rendez-vous
    if (type === "appointment") {
      let color, label;
      switch (statut) {
        case "planifié":
          color = "bg-blue-100 text-blue-700 border-blue-300";
          label = "Planifié";
          break;
        case "terminé":
          color = "bg-green-100 text-green-700 border-green-300";
          label = "Terminé";
          break;
        case "annulé":
          color = "bg-red-100 text-red-700 border-red-300";
          label = "Annulé";
          break;
        case "en_cours":
          color = "bg-yellow-100 text-yellow-700 border-yellow-300";
          label = "En cours";
          break;
        default:
          color = "bg-gray-100 text-gray-700 border-gray-300";
          label = statut;
      }
      return (
        <span
          className={`inline-block border px-2 py-0.5 rounded text-xs font-semibold ml-2 ${color}`}
        >
          {label}
        </span>
      );
    }

    return null;
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
            <h3
              className={`text-sm font-medium text-gray-900 ${
                type === "document"
                  ? "max-w-[120px] break-words sm:max-w-xs sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap"
                  : ""
              }`}
              title={type === "document" ? title : undefined}
            >
              {type === "document" && title ? (
                title.length > 40 ? (
                  <>
                    <span className="hidden sm:inline">
                      {title.slice(0, 40) + "…"}
                    </span>
                    <span className="sm:hidden">
                      {title.length > 20 ? title.slice(0, 20) + "…" : title}
                    </span>
                  </>
                ) : (
                  <>{title}</>
                )
              ) : (
                title
              )}
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
