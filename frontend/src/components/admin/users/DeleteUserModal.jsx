import React, { useState } from "react";
import {
  FaTimesCircle,
  FaSpinner,
  FaUser,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";

const DeleteUserModal = ({ user, onClose, onConfirm, loading = false }) => {
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() === "supprimer") {
      try {
        await onConfirm(user.id);
        onClose();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === "supprimer";

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="bg-red-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Supprimer l'utilisateur</h2>
                <p className="text-sm opacity-80">Action irréversible</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTimesCircle size={20} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <div>
                <p className="text-[#343A40] font-medium">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-[#6C757D] text-sm">{user.email}</p>
                <p className="text-[#6C757D] text-sm">
                  ID: {user.id} - Rôle: {user.role}
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-medium mb-2">
                    Attention : Action irréversible
                  </h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• L'utilisateur sera définitivement supprimé</li>
                    <li>• Toutes ses données seront perdues</li>
                    <li>• Cette action ne peut pas être annulée</li>
                    {user.role === "patient" && (
                      <li>• Son dossier médical sera également supprimé</li>
                    )}
                    {user.role === "medecin" && (
                      <li>
                        • Ses rendez-vous et disponibilités seront supprimés
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Pour confirmer, tapez "supprimer" :
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  confirmText && !isConfirmValid
                    ? "border-red-500 bg-red-50"
                    : "border-[#E9ECEF]"
                }`}
                placeholder="Tapez 'supprimer' pour confirmer"
              />
              {confirmText && !isConfirmValid && (
                <p className="text-red-500 text-sm mt-1">
                  Veuillez taper exactement "supprimer"
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-[#64748B] hover:text-[#343A40] rounded-lg border border-[#E9ECEF] hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
              disabled={!isConfirmValid || loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <FaTrash className="mr-2" />
                  Supprimer définitivement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
