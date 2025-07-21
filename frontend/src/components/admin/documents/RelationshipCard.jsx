import React from "react";
import { FaUser, FaUserMd, FaCalendar, FaTrash, FaLink } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";

const RelationshipCard = ({ relationship, onDelete }) => {
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
          <div className="p-2 bg-green-100 rounded-lg">
            <FaLink className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Suivi médical
            </h3>
            <p className="text-sm text-gray-600">
              Statut: <span className="text-green-600 font-medium">Actif</span>
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() =>
              onDelete(relationship.patient_id, relationship.doctor_id)
            }
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer le lien"
          >
            <FaTrash className="text-lg" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Informations du patient */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <FaUser className="text-blue-600" />
            <span className="font-medium text-blue-900">Patient</span>
          </div>
          <div className="ml-6">
            <p
              className="text-sm font-medium text-gray-900"
              title={`${relationship.patient_nom} ${relationship.patient_prenom}`}
            >
              {truncateText(
                `${relationship.patient_nom} ${relationship.patient_prenom}`,
                20
              )}
            </p>
            <p
              className="text-xs text-gray-600"
              title={relationship.patient_email}
            >
              {truncateText(relationship.patient_email, 25)}
            </p>
          </div>
        </div>

        {/* Informations du médecin */}
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <MdMedicalServices className="text-green-600" />
            <span className="font-medium text-green-900">Médecin</span>
          </div>
          <div className="ml-6">
            <p
              className="text-sm font-medium text-gray-900"
              title={`${relationship.doctor_nom} ${relationship.doctor_prenom}`}
            >
              {truncateText(
                `${relationship.doctor_nom} ${relationship.doctor_prenom}`,
                20
              )}
            </p>
            <p
              className="text-xs text-gray-600"
              title={relationship.doctor_email}
            >
              {truncateText(relationship.doctor_email, 25)}
            </p>
            <p
              className="text-xs text-gray-600"
              title={relationship.specialite}
            >
              Spécialité: {truncateText(relationship.specialite, 15)}
            </p>
          </div>
        </div>

        {/* Date de création */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaCalendar className="text-gray-400" />
          <span>Lien créé le: {formatDate(relationship.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            ID Patient: {relationship.patient_id} | ID Médecin:{" "}
            {relationship.doctor_id}
          </span>
          <button
            onClick={() =>
              onDelete(relationship.patient_id, relationship.doctor_id)
            }
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipCard;
