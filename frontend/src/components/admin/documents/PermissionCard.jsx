import React from "react";
import {
  FaUser,
  FaCalendar,
  FaTrash,
  FaEye,
  FaShieldAlt,
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";

const PermissionCard = ({ permission, onDelete }) => {
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

  const getRoleColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "author":
        return "bg-blue-100 text-blue-800";
      case "shared":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserIcon = (userRole) => {
    switch (userRole) {
      case "medecin":
        return <MdMedicalServices className="text-green-600" />;
      case "patient":
        return <FaUser className="text-blue-600" />;
      case "admin":
        return <FaShieldAlt className="text-purple-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaEye className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Accès au document
            </h3>
            <p
              className="text-sm text-gray-600"
              title={permission.document_nom || `ID: ${permission.document_id}`}
            >
              Document:{" "}
              {truncateText(
                permission.document_nom || `ID: ${permission.document_id}`,
                25
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onDelete(permission.document_id, permission.user_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Révoquer l'accès"
          >
            <FaTrash className="text-lg" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Informations de l'utilisateur */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            {getUserIcon(permission.user_role)}
            <span className="font-medium text-gray-900">Utilisateur</span>
          </div>
          <div className="ml-6">
            <p
              className="text-sm font-medium text-gray-900"
              title={`${permission.user_nom} ${permission.user_prenom}`}
            >
              {truncateText(
                `${permission.user_nom} ${permission.user_prenom}`,
                20
              )}
            </p>
            <p className="text-xs text-gray-600" title={permission.user_email}>
              {truncateText(permission.user_email, 25)}
            </p>
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getRoleColor(
                permission.user_role
              )}`}
            >
              {permission.user_role}
            </span>
          </div>
        </div>

        {/* Informations du patient propriétaire */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <FaUser className="text-blue-600" />
            <span className="font-medium text-blue-900">
              Patient propriétaire
            </span>
          </div>
          <div className="ml-6">
            <p
              className="text-sm font-medium text-gray-900"
              title={`${permission.patient_nom} ${permission.patient_prenom}`}
            >
              {truncateText(
                `${permission.patient_nom} ${permission.patient_prenom}`,
                20
              )}
            </p>
          </div>
        </div>

        {/* Niveau d'accès */}
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <FaShieldAlt className="text-yellow-600" />
            <span className="font-medium text-yellow-900">Niveau d'accès</span>
          </div>
          <div className="ml-6">
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${getRoleColor(
                permission.role
              )}`}
            >
              {permission.role}
            </span>
            <p className="text-xs text-gray-600 mt-1">
              {permission.role === "owner" && "Propriétaire du document"}
              {permission.role === "author" && "Auteur du document"}
              {permission.role === "shared" && "Accès partagé"}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaCalendar className="text-gray-400" />
            <span>Accès accordé le: {formatDate(permission.granted_at)}</span>
          </div>
          {permission.expires_at && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaCalendar className="text-gray-400" />
              <span>Expire le: {formatDate(permission.expires_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Document ID: {permission.document_id} | User ID:{" "}
            {permission.user_id}
          </span>
          <button
            onClick={() => onDelete(permission.document_id, permission.user_id)}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Révoquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionCard;
