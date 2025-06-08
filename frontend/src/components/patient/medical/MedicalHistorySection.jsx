import React from "react";
import { FaHistory, FaPlus, FaChevronRight } from "react-icons/fa";
import ItemCard from "../common/ItemCard";

/**
 * Section affichant les antécédents médicaux du patient
 * @param {Array} history - Liste des antécédents médicaux
 * @param {Function} onAdd - Fonction appelée lors du clic sur le bouton d'ajout
 * @param {Function} onDetails - Fonction appelée lors du clic sur un antécédent
 * @param {Function} onViewAll - Fonction appelée lors du clic sur "Voir tout"
 * @param {Number} limit - Nombre maximum d'antécédents à afficher (facultatif)
 */
const MedicalHistorySection = ({
  history,
  onAdd,
  onDetails,
  onViewAll,
  limit,
}) => {
  // Si une limite est définie, on ne garde que les n premiers éléments
  const displayedHistory = limit ? history.slice(0, limit) : history;
  const hasMore = limit && history.length > limit;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* En-tête de la section */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaHistory className="text-xl text-blue-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">
              Antécédents médicaux
            </h2>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center px-3 py-1.5 border border-primary text-primary rounded-lg text-sm hover:bg-primary hover:text-white transition-colors"
          >
            <FaPlus className="mr-1.5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des antécédents */}
      <div className="p-3 space-y-3">
        {displayedHistory.length === 0 ? (
          <div className="text-center text-gray-500">
            Aucun antécédent médical enregistré
          </div>
        ) : (
          displayedHistory.map((item, index) => (
            <div key={item.id || index}>
              <ItemCard
                type="history"
                title={item.type}
                date={item.date}
                onViewDetails={() => onDetails(item)}
                detailsText="Détails"
              />
            </div>
          ))
        )}
      </div>

      {/* Bouton "Voir tout" si nécessaire */}
      {hasMore && (
        <div className="p-3">
          <button
            onClick={onViewAll}
            className="w-full flex items-center justify-center text-primary font-medium hover:text-primary/80"
          >
            Voir tout ({history.length})
            <FaChevronRight className="ml-1 text-xs" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalHistorySection;
