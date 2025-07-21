import React from "react";

const UserFilters = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtre par rôle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rôle
          </label>
          <select
            value={filters.role || ""}
            onChange={(e) => onFilterChange("role", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="medecin">Médecin</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        {/* Recherche par nom/email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recherche
          </label>
          <input
            type="text"
            placeholder="Nom, prénom ou email..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
