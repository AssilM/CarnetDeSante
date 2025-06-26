import React from "react";

/**
 * Composant pour afficher les détails d'un antécédent médical
 * @param {Object} history - L'antécédent médical à afficher
 * @param {Function} onClose - Fonction pour fermer les détails
 */
const MedicalHistoryDetails = ({ history, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Détails de l'antécédent médical
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          × Fermer
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">
            Type d'antécédent
          </h3>
          <p className="mt-1 text-sm text-gray-900">{history.type}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date de début</h3>
            <p className="mt-1 text-sm text-gray-900">
              {history.startDate || "Non spécifié"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Date de fin</h3>
            <p className="mt-1 text-sm text-gray-900">
              {history.endDate || "En cours"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-sm text-gray-900">
            {history.description || "Aucune description"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Traitement</h3>
          <p className="mt-1 text-sm text-gray-900">
            {history.treatment || "Aucun traitement spécifié"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Médecin traitant
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {history.doctor || "Non spécifié"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Établissement de santé
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {history.hospital || "Non spécifié"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryDetails;
