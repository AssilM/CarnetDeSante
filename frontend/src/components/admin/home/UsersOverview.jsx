import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/api";
import {
  FaUsers,
  FaUser,
  FaUserMd,
  FaUserShield,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const UsersOverview = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    patients: 0,
    medecins: 0,
    admins: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await adminService.getAllUsersWithDetails();
      setUsers(usersData);
      calculateStats(usersData);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const stats = {
      total: usersData.length,
      patients: usersData.filter((user) => user.role === "patient").length,
      medecins: usersData.filter((user) => user.role === "medecin").length,
      admins: usersData.filter((user) => user.role === "admin").length,
    };
    setStats(stats);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "patient":
        return <FaUser className="text-blue-500" />;
      case "medecin":
        return <FaUserMd className="text-green-500" />;
      case "admin":
        return <FaUserShield className="text-purple-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "patient":
        return "Patient";
      case "medecin":
        return "Médecin";
      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "patient":
        return "bg-blue-100 text-blue-800";
      case "medecin":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.patients}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUser className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Médecins</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.medecins}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaUserMd className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaUserShield className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs récents */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUsers className="mr-2 text-blue-600" />
            Utilisateurs récents
          </h3>
          <button
            onClick={loadUsers}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Actualiser
          </button>
        </div>

        <div className="space-y-3">
          {users.slice(0, 6).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <FaEdit size={14} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUsers className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}

        {users.length > 6 && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {users.length - 6} autres utilisateurs...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersOverview;
