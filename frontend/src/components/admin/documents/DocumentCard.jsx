import React from "react";
import {
  FaFileMedical,
  FaUser,
  FaCalendar,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";

const DocumentCard = ({ document, onViewPermissions, onViewDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FaFileMedical className="text-primary text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold text-gray-900"
              title={document.titre || "Document sans nom"}
            >
              {truncateText(document.titre || "Document sans nom", 25)}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              Type: {document.type_document_label || "Non spécifié"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Informations du patient */}
        <div className="flex items-center space-x-2">
          <FaUser className="text-gray-400 flex-shrink-0" />
          <span
            className="text-sm text-gray-600"
            title={`Patient: ${document.patient_nom} ${document.patient_prenom}`}
          >
            Patient:{" "}
            {truncateText(
              `${document.patient_nom} ${document.patient_prenom}`,
              20
            )}
          </span>
        </div>

        {/* Informations du médecin si applicable */}
        {document.medecin_nom && (
          <div className="flex items-center space-x-2">
            <MdMedicalServices className="text-gray-400 flex-shrink-0" />
            <span
              className="text-sm text-gray-600"
              title={`Médecin: ${document.medecin_nom} ${document.medecin_prenom}`}
            >
              Médecin:{" "}
              {truncateText(
                `${document.medecin_nom} ${document.medecin_prenom}`,
                20
              )}
            </span>
          </div>
        )}

        {/* Date de création */}
        <div className="flex items-center space-x-2">
          <FaCalendar className="text-gray-400" />
          <span className="text-sm text-gray-600">
            Créé le: {formatDate(document.created_at)}
          </span>
        </div>

        {/* Taille du fichier */}
        {document.taille && (
          <div className="text-sm text-gray-600">
            Taille: {(document.taille / 1024 / 1024).toFixed(2)} MB
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {document.id}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => onViewPermissions(document.id)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Voir permissions
            </button>
            <button
              onClick={() => onViewDetails(document.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Voir les détails"
            >
              <FaEye className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
