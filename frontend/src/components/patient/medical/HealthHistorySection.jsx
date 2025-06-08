import React from "react";
import { FaCalendarAlt, FaChevronRight } from "react-icons/fa";
import ItemCard from "../common/ItemCard";

/**
 * Section affichant l'historique de santé du patient
 * @param {Array} events - Liste des événements de santé
 * @param {String} activeFilter - Filtre actif (jour/mois/année)
 * @param {Function} onFilterChange - Fonction appelée lors du changement de filtre
 * @param {Function} onDetails - Fonction appelée lors du clic sur un événement
 * @param {Function} onViewAll - Fonction appelée lors du clic sur "Voir tout"
 * @param {Number} limit - Nombre maximum d'événements à afficher (facultatif)
 */
const HealthHistorySection = ({
  events,
  activeFilter,
  onFilterChange,
  onDetails,
  onViewAll,
  limit,
}) => {
  // Si une limite est définie, on ne garde que les n premiers éléments
  const displayedEvents = limit ? events.slice(0, limit) : events;
  const hasMore = limit && events.length > limit;

  return (
    <div className="space-y-6">
      {/* En-tête de la section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
            <FaCalendarAlt className="text-xl text-primary" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">
            Historique de santé
          </h2>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium">Trier par :</span>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("jour")}
              className={`px-4 py-2 rounded-lg ${
                activeFilter === "jour"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => onFilterChange("mois")}
              className={`px-4 py-2 rounded-lg ${
                activeFilter === "mois"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => onFilterChange("année")}
              className={`px-4 py-2 rounded-lg ${
                activeFilter === "année"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Année
            </button>
          </div>
        </div>
      </div>

      {/* Liste des événements */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 space-y-3">
          {displayedEvents.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucun événement pour cette période
            </div>
          ) : (
            displayedEvents.map((event, index) => (
              <div key={event.id || index}>
                <ItemCard
                  type="event"
                  title={event.title}
                  date={event.date}
                  subtitle={event.doctor}
                  onViewDetails={() => onDetails(event)}
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
              Voir tout ({events.length})
              <FaChevronRight className="ml-1 text-xs" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthHistorySection;
