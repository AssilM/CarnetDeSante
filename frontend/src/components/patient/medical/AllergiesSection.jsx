import React from "react";
import { FaAllergies, FaPlus, FaChevronRight } from "react-icons/fa";
import ItemCard from "../common/ItemCard";
import { useAllergyContext } from "../../../context";

/**
 * Section affichant les allergies du patient
 * @param {Array} allergies - Liste des allergies
 * @param {Function} onAdd - Fonction appelée lors du clic sur le bouton d'ajout
 * @param {Function} onDetails - Fonction appelée lors du clic sur une allergie
 * @param {Function} onViewAll - Fonction appelée lors du clic sur "Voir tout"
 * @param {Number} limit - Nombre maximum d'allergies à afficher (facultatif)
 */
const AllergiesSection = ({
  allergies,
  onAdd,
  onDetails,
  onViewAll,
  limit,
}) => {
  const { togglePinned } = useAllergyContext();

  // Si une limite est définie, on ne garde que les n premiers éléments
  const displayedAllergies = limit ? allergies.slice(0, limit) : allergies;
  const hasMore = limit && allergies.length > limit;

  const handleTogglePin = (id) => {
    togglePinned(id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* En-tête de la section */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaAllergies className="text-xl text-red-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Allergies</h2>
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

      {/* Liste des allergies */}
      <div className="p-3 space-y-3">
        {displayedAllergies.length === 0 ? (
          <div className="text-center text-gray-500">
            Aucune allergie enregistrée
          </div>
        ) : (
          displayedAllergies.map((item, index) => (
            <div key={item.id || index}>
              <ItemCard
                type="allergy"
                title={item.type}
                date={item.date}
                onViewDetails={() => onDetails(item)}
                detailsText="Détails"
                pinned={item.pinned}
                onTogglePin={() => handleTogglePin(item.id)}
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
            Voir tout ({allergies.length})
            <FaChevronRight className="ml-1 text-xs" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllergiesSection;
