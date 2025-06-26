import React from "react";

/**
 * Composant pour afficher les détails d'un événement de santé
 * @param {Object} event - L'événement de santé à afficher
 * @param {Function} onClose - Fonction pour fermer les détails
 */
const HealthEventDetails = ({ event, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Détails de l'événement
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          × Fermer
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="mt-1 text-sm text-gray-900">{event.date}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Titre</h3>
          <p className="mt-1 text-sm text-gray-900">{event.title}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Médecin</h3>
          <p className="mt-1 text-sm text-gray-900">
            {event.doctor || "Non spécifié"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-sm text-gray-900">
            {event.description || "Aucune description disponible"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Observations</h3>
          <p className="mt-1 text-sm text-gray-900">
            {event.observations || "Aucune observation"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Prescriptions</h3>
          <p className="mt-1 text-sm text-gray-900">
            {event.prescriptions || "Aucune prescription"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Recommandations</h3>
          <p className="mt-1 text-sm text-gray-900">
            {event.recommendations || "Aucune recommandation"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthEventDetails;
