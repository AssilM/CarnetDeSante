import React from "react";

const UserCard = ({ user, onEdit, onDelete }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "medecin":
        return "bg-blue-100 text-blue-800";
      case "patient":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "medecin":
        return "Médecin";
      case "patient":
        return "Patient";
      default:
        return role;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.prenom} {user.nom}
            </h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
              user.role
            )}`}
          >
            {getRoleLabel(user.role)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Téléphone:</span>
          <p className="text-gray-900">
            {user.tel_indicatif && user.tel_numero
              ? `${user.tel_indicatif} ${user.tel_numero}`
              : "Non renseigné"}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Date d'inscription:</span>
          <p className="text-gray-900">
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString("fr-FR")
              : "Date inconnue"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>ID: {user.id}</span>
          {user.last_login && (
            <span>
              • Dernière connexion:{" "}
              {new Date(user.last_login).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Modifier
          </button>

          <button
            onClick={() => onDelete(user)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
