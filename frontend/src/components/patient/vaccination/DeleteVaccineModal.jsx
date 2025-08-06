import React from "react";
import { FaExclamationTriangle, FaSyringe, FaTimes } from "react-icons/fa";

const DeleteVaccineModal = ({
  vaccine,
  open,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!open) return null;

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
            Êtes-vous sûr de vouloir supprimer le vaccin "
            {vaccine?.name}" ? Cette action est irréversible.
          </p>

          {vaccine && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <FaSyringe className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {vaccine.name}
                  </p>
                  {vaccine.date && (
                    <p className="text-sm text-gray-500">
                      Date: {new Date(vaccine.date).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                  {vaccine.doctor && (
                    <p className="text-sm text-gray-500">
                      Vaccinateur: {vaccine.doctor}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-medium mb-2">
                  Attention : Action irréversible
                </h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Le vaccin sera définitivement supprimé</li>
                  <li>• Cette action ne peut pas être annulée</li>
                  <li>• Les informations de vaccination seront perdues</li>
                </ul>
              </div>
            </div>
          </div>
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
              <FaSyringe />
            )}
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteVaccineModal; 