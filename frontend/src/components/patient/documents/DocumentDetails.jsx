import React from "react";
import { FaDownload, FaEye } from "react-icons/fa";

/**
 * Composant pour afficher les détails d'un document médical
 * @param {Object} document - Le document à afficher
 * @param {Function} onClose - Fonction pour fermer les détails
 */
const DocumentDetails = ({ document, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Détails du document
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          × Fermer
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Titre</h3>
          <p className="mt-1 text-sm text-gray-900">{document.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Type de document
            </h3>
            <p className="mt-1 text-sm text-gray-900">{document.type}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Date</h3>
            <p className="mt-1 text-sm text-gray-900">{document.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Médecin</h3>
            <p className="mt-1 text-sm text-gray-900">
              {document.doctor || "Non spécifié"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Établissement</h3>
            <p className="mt-1 text-sm text-gray-900">
              {document.hospital || "Non spécifié"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-sm text-gray-900">
            {document.description || "Aucune description"}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => window.open(document.fileUrl, "_blank")}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaEye className="mr-2" />
              Visualiser
            </button>
            <button
              onClick={() => window.open(document.fileUrl, "_blank")}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaDownload className="mr-2" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
