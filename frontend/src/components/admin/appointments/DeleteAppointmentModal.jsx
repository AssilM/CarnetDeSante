import React from "react";
import { FaExclamationTriangle, FaTrash, FaTimes } from "react-icons/fa";

const DeleteAppointmentModal = ({
  appointment,
  open,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!open) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatTime = (time) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaExclamationTriangle className="text-red-600 mr-2" />
            Confirmer la suppression
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est
            irréversible.
          </p>

          {appointment && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Détails du rendez-vous :
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Date :</strong> {formatDate(appointment.date)}
                </p>
                <p>
                  <strong>Heure :</strong> {formatTime(appointment.heure)}
                </p>
                <p>
                  <strong>Patient :</strong> {appointment.patient_prenom}{" "}
                  {appointment.patient_nom}
                </p>
                <p>
                  <strong>Médecin :</strong> Dr. {appointment.medecin_prenom}{" "}
                  {appointment.medecin_nom}
                </p>
                {appointment.motif && (
                  <p>
                    <strong>Motif :</strong> {appointment.motif}
                  </p>
                )}
                <p>
                  <strong>Statut :</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      appointment.statut === "confirmé"
                        ? "bg-green-100 text-green-800"
                        : appointment.statut === "planifié"
                        ? "bg-blue-100 text-blue-800"
                        : appointment.statut === "annulé"
                        ? "bg-red-100 text-red-800"
                        : appointment.statut === "en_cours"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {appointment.statut}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaTrash />
            )}
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAppointmentModal;
