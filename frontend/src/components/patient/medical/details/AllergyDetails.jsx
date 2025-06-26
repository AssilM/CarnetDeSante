import React from "react";

const allergyTypes = {
  food: "Alimentaire",
  medication: "Médicamenteuse",
  environmental: "Environnementale",
  insect: "Insectes",
  latex: "Latex",
  other: "Autre",
};

const severityLevels = {
  mild: "Légère",
  moderate: "Modérée",
  severe: "Sévère",
  lifeThreatening: "Potentiellement mortelle",
};

/**
 * Composant pour afficher les détails d'une allergie
 * @param {Object} allergy - L'allergie à afficher
 * @param {Function} onClose - Fonction pour fermer les détails
 */
const AllergyDetails = ({ allergy, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Détails de l'allergie
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          × Fermer
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Type d'allergie
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {allergyTypes[allergy.type] || allergy.type || "Non spécifié"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Allergène</h3>
            <p className="mt-1 text-sm text-gray-900">
              {allergy.allergen || "Non spécifié"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Sévérité</h3>
          <p className="mt-1 text-sm text-gray-900">
            {severityLevels[allergy.severity] ||
              allergy.severity ||
              "Non spécifié"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Symptômes</h3>
          <p className="mt-1 text-sm text-gray-900">
            {allergy.symptoms || "Aucun symptôme spécifié"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Diagnostic</h3>
          <p className="mt-1 text-sm text-gray-900">
            {allergy.diagnosis || "Aucun diagnostic spécifié"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">
            Traitement / Précautions
          </h3>
          <p className="mt-1 text-sm text-gray-900">
            {allergy.treatment || "Aucun traitement spécifié"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllergyDetails;
