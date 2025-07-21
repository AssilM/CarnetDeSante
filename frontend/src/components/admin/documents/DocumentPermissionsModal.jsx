import React from "react";
import { FaTimes, FaEyeSlash, FaUserMd } from "react-icons/fa";

const DocumentPermissionsModal = ({
  open,
  onClose,
  permissions,
  onRevoke,
  loadingRevoke,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative animate-fade-in overflow-hidden border border-gray-200">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl z-10"
          onClick={onClose}
          aria-label="Fermer"
        >
          <FaTimes />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FaUserMd className="mr-3 text-blue-600" />
            Médecins ayant accès au document
          </h2>

          {permissions.length === 0 ? (
            <div className="text-center py-12">
              <FaUserMd className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600">
                Aucun médecin n'a accès à ce document.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map((perm) => (
                <div
                  key={perm.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserMd className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {perm.nom} {perm.prenom}
                      </p>
                      <p className="text-sm text-gray-500">Rôle: {perm.role}</p>
                    </div>
                  </div>

                  {perm.role === "shared" && (
                    <button
                      onClick={() => onRevoke && onRevoke(perm.user_id)}
                      disabled={loadingRevoke === perm.user_id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      <FaEyeSlash className="text-xs" />
                      <span>
                        {loadingRevoke === perm.user_id
                          ? "Révocation..."
                          : "Révoquer"}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPermissionsModal;
