import React, { useState } from "react";
import ItemCard from "./ItemCard";
import { FaArrowLeft, FaThumbtack } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Composant de liste réutilisable pour afficher une collection d'éléments
 * @param {Array} items - Liste des éléments à afficher
 * @param {string} type - Type d'éléments ('document', 'vaccine', 'history' ou 'allergy')
 * @param {string} title - Titre de la section
 * @param {string} description - Description de la section
 * @param {Function} onAdd - Fonction appelée pour ajouter un élément
 * @param {Function} onViewDetails - Fonction appelée pour voir les détails d'un élément
 * @param {Function} onTogglePin - Fonction appelée pour épingler/désépingler un élément
 * @param {string} addButtonText - Texte du bouton d'ajout
 * @param {string} backUrl - URL pour le bouton retour (optionnel)
 * @param {Function} onBack - Fonction pour gérer le retour (optionnel)
 * @param {React.ReactNode} rightAction - Action supplémentaire à afficher à droite (optionnel)
 * @param {string} detailsText - Texte du bouton de détails (optionnel)
 * @param {boolean} showPinnedSection - Afficher une section dédiée aux éléments épinglés
 */
const ItemsList = ({
  items,
  type,
  title,
  description,
  onAdd,
  onViewDetails,
  onTogglePin,
  addButtonText = "Ajouter",
  backUrl,
  onBack,
  rightAction,
  detailsText,
  itemNameField = "title",
  itemSubtitleField = "subtitle",
  countText,
  showPinnedSection = true,
  slider
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    }
  };

  // Texte du compteur d'items
  const getCountText = () => {
    if (countText) return countText;

    const typeName =
      type === "document"
        ? "document"
        : type === "vaccine"
        ? "vaccin"
        : type === "history"
        ? "antécédent"
        : type === "allergy"
        ? "allergie"
        : type === "event"
        ? "événement"
        : "élément";

    return `${items.length} ${
      items.length > 1 ? `${typeName}s disponibles` : `${typeName} disponible`
    }`;
  };

  // Filtrer les éléments épinglés
  const pinnedItems = items.filter((item) => item.pinned);
  const filteredItems = activeTab === "pinned" ? pinnedItems : items;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bouton retour si nécessaire */}
        {(backUrl || onBack) && (
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="mr-2" />
              Retour
            </button>
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            {rightAction}
            {onAdd && (
              <button
                onClick={onAdd}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {addButtonText}
              </button>
            )}
          </div>
        </div>

        {slider && (
          <div className="w-full">{slider}</div>
        )}

        {/* Filtres de navigation pour épinglés/tous */}
        {showPinnedSection && pinnedItems.length > 0 && (
          <div className="flex gap-4 mb-6">
            <button
              className={`text-sm font-medium ${
                activeTab === "all"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              Tous
            </button>
            <button
              className={`text-sm font-medium flex items-center gap-1 ${
                activeTab === "pinned"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("pinned")}
            >
              <FaThumbtack className="text-xs" />
              Épinglés ({pinnedItems.length})
            </button>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-4">{getCountText()}</p>
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                {activeTab === "pinned"
                  ? "Aucun élément épinglé"
                  : "Aucun élément disponible"}
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <ItemCard
                  key={item.id || index}
                  type={type}
                  title={
                    item[itemNameField] ||
                    item.name ||
                    item.type ||
                    "Sans titre"
                  }
                  date={item.date}
                  subtitle={
                    typeof item[itemSubtitleField] === "object"
                      ? item[itemSubtitleField]?.name || ""
                      : item[itemSubtitleField] || item.description || ""
                  }
                  onViewDetails={() => onViewDetails(item)}
                  detailsText={detailsText}
                  pinned={item.pinned}
                  onTogglePin={
                    onTogglePin ? () => onTogglePin(item.id) : undefined
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsList;
