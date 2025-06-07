import React from "react";
import { FaCalendarAlt, FaFilePdf } from "react-icons/fa";

/**
 * Composant pour afficher les détails d'un vaccin
 * @param {Object} vaccine - Le vaccin à afficher
 * @param {Function} onClose - Fonction pour fermer les détails
 */
const VaccineDetails = ({ vaccine, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Détails du vaccin
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          × Fermer
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Nom du vaccin</h3>
          <p className="mt-1 text-sm text-gray-900">{vaccine.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Type de vaccin
            </h3>
            <p className="mt-1 text-sm text-gray-900">{vaccine.type}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Fabricant</h3>
            <p className="mt-1 text-sm text-gray-900">{vaccine.manufacturer}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Date de vaccination
            </h3>
            <p className="mt-1 text-sm text-gray-900">{vaccine.date}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Prochaine dose
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {vaccine.nextDose || "Non programmée"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Médecin</h3>
            <p className="mt-1 text-sm text-gray-900">{vaccine.doctor}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Lieu de vaccination
            </h3>
            <p className="mt-1 text-sm text-gray-900">{vaccine.location}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Numéro de lot</h3>
          <p className="mt-1 text-sm text-gray-900">{vaccine.lotNumber}</p>
        </div>

        {vaccine.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 text-sm text-gray-900">{vaccine.notes}</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            {vaccine.nextDose && (
              <button
                onClick={() => {
                  /* Ajouter au calendrier */
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaCalendarAlt className="mr-2" />
                Ajouter au calendrier
              </button>
            )}
            <button
              onClick={() => {
                /* Générer le certificat */
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaFilePdf className="mr-2" />
              Certificat de vaccination
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineDetails;
