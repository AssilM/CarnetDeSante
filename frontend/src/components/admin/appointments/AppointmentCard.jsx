import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaUserMd,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPlay,
  FaStop,
} from "react-icons/fa";

const AppointmentCard = ({
  appointment,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onStart,
  onFinish,
  loading = false,
}) => {
  const getStatusColor = (statut) => {
    switch (statut) {
      case "confirmé":
        return "bg-green-100 text-green-800";
      case "planifié":
        return "bg-blue-100 text-blue-800";
      case "annulé":
        return "bg-red-100 text-red-800";
      case "en_cours":
        return "bg-yellow-100 text-yellow-800";
      case "terminé":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case "confirmé":
        return "Confirmé";
      case "planifié":
        return "Planifié";
      case "annulé":
        return "Annulé";
      case "en_cours":
        return "En cours";
      case "terminé":
        return "Terminé";
      default:
        return statut;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatTime = (time) => {
    if (!time) return "";
    return time.substring(0, 5); // Afficher seulement HH:MM
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-blue-600" />
          <span className="font-semibold text-gray-900">
            {formatDate(appointment.date)}
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
            appointment.statut
          )}`}
        >
          {getStatusLabel(appointment.statut)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <FaClock className="text-gray-500" />
          <span className="text-gray-700">{formatTime(appointment.heure)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <FaUser className="text-blue-500" />
          <span className="text-gray-700">
            {appointment.patient_prenom} {appointment.patient_nom}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <FaUserMd className="text-green-500" />
          <span className="text-gray-700">
            Dr. {appointment.medecin_prenom} {appointment.medecin_nom}
          </span>
        </div>

        {appointment.adresse && (
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt className="text-red-500" />
            <span className="text-gray-700">{appointment.adresse}</span>
          </div>
        )}

        {appointment.motif && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              <strong>Motif :</strong> {appointment.motif}
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">ID: {appointment.id}</div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {appointment.statut === "planifié" && (
              <>
                <button
                  onClick={() => onConfirm(appointment.id)}
                  disabled={loading}
                  className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <FaCheck />
                  <span>Confirmer</span>
                </button>
                <button
                  onClick={() => onCancel(appointment.id)}
                  disabled={loading}
                  className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                >
                  <FaTimes />
                  <span>Annuler</span>
                </button>
              </>
            )}

            {appointment.statut === "confirmé" && (
              <button
                onClick={() => onStart(appointment.id)}
                disabled={loading}
                className="flex items-center space-x-1 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                <FaPlay />
                <span>Démarrer</span>
              </button>
            )}

            {appointment.statut === "en_cours" && (
              <button
                onClick={() => onFinish(appointment.id)}
                disabled={loading}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
              >
                <FaStop />
                <span>Terminer</span>
              </button>
            )}

            <button
              onClick={() => onEdit(appointment)}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              <FaEdit />
              <span>Modifier</span>
            </button>

            <button
              onClick={() => onDelete(appointment.id)}
              disabled={loading}
              className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
            >
              <FaTrash />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
