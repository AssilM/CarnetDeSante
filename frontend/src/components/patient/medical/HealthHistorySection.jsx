import React from "react";

/**
 * Composant de filtrage par date
 * Affiche les options de filtrage (Jour/Mois/Année) et gère leur sélection
 * @param {string} activeFilter - Le filtre actuellement sélectionné
 * @param {function} onFilterChange - Callback appelé lors du changement de filtre
 */
const DateFilter = ({ activeFilter, onFilterChange }) => (
  <div className="bg-white rounded-lg shadow-sm p-4">
    <div className="flex gap-4 text-sm">
      <span className="text-gray-500">Trier par :</span>
      {/* Création des boutons de filtre à partir d'un tableau */}
      {["Jour", "Mois", "Année"].map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter.toLowerCase())}
          className={`${
            activeFilter === filter.toLowerCase()
              ? "font-medium text-gray-900" // Style pour le filtre actif
              : "text-gray-500 hover:text-gray-700" // Style pour les filtres inactifs
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Composant représentant un événement médical individuel
 * C'est la plus petite unité d'affichage, comme une "carte" d'événement
 * @param {string} icon - Icône de l'événement (non utilisé actuellement)
 * @param {string} title - Titre de l'événement médical
 * @param {string} doctor - Nom du médecin
 * @param {function} onDetails - Callback pour voir les détails
 */
const HealthEvent = ({ icon, title, doctor, onDetails }) => (
  <div className="bg-white rounded-lg shadow-sm p-4">
    <div className="flex items-center gap-4">
      {/* Icône rouge circulaire */}
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
        <div className="w-6 h-6 bg-red-500 rounded-full" />
      </div>
      {/* Informations de l'événement */}
      <div className="flex-grow">
        <div className="text-sm text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{doctor}</div>
      </div>
      {/* Bouton pour voir les détails */}
      <button
        onClick={onDetails}
        className="text-sm text-gray-700 hover:text-gray-900"
      >
        Détails ›
      </button>
    </div>
  </div>
);

/**
 * Composant regroupant tous les événements d'une même date
 * Agit comme un conteneur qui organise les HealthEvent sous une date commune
 * @param {string} date - La date du groupe d'événements
 * @param {Array} events - Liste des événements pour cette date
 * @param {function} onDetails - Callback pour voir les détails d'un événement
 */
const EventGroup = ({ date, events, onDetails }) => (
  <div className="space-y-4">
    {/* En-tête avec la date */}
    <div className="text-sm text-gray-500">{date}</div>
    {/* Affichage de tous les événements de cette date */}
    {events.map((event, index) => (
      <HealthEvent
        key={index}
        icon={event.icon}
        title={event.title}
        doctor={event.doctor}
        onDetails={() => onDetails(event)}
      />
    ))}
  </div>
);

/**
 * Composant principal de la section historique
 * Orchestre l'ensemble de l'affichage : filtres et événements groupés par date
 * @param {Array} events - Liste complète des événements médicaux
 * @param {string} activeFilter - Filtre actif (jour/mois/année)
 * @param {function} onFilterChange - Callback pour changer de filtre
 * @param {function} onDetails - Callback pour voir les détails d'un événement
 */
const HealthHistorySection = ({
  events,
  activeFilter,
  onFilterChange,
  onDetails,
}) => {
  // Regroupement des événements par date
  // Crée un objet où les clés sont les dates et les valeurs sont les tableaux d'événements
  const groupedEvents = events.reduce((groups, event) => {
    const date = event.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Composant de filtrage en haut */}
      <DateFilter activeFilter={activeFilter} onFilterChange={onFilterChange} />

      {/* Liste des groupes d'événements */}
      <div className="space-y-6">
        {/* Transformation de l'objet groupé en composants EventGroup */}
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <EventGroup
            key={date}
            date={date}
            events={dateEvents}
            onDetails={onDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default HealthHistorySection;
