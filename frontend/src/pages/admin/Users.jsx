import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/api";
import {
  UserCard,
  UserFilters,
  UserStats,
  EditUserModal,
  DeleteUserModal,
} from "../../components/admin/users";
import PageWrapper from "../../components/PageWrapper";

import { useNavigate } from "react-router-dom";
import {
  FaFileMedical,
  FaSearch,
  FaUser,
  FaUserMd,
  FaShieldAlt,
} from "react-icons/fa";

const Users = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    patients: 0,
    medecins: 0,
    admins: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Ne charger les données que si l'utilisateur est admin
    if (currentUser && currentUser.role === "admin") {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    // Filtrer les utilisateurs quand les filtres changent
    filterUsers();
  }, [users, filters]);

  const loadUsers = async () => {
    // Vérifier que l'utilisateur est admin
    if (!currentUser || currentUser.role !== "admin") {
      setError("Accès non autorisé - Rôle administrateur requis");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const usersData = await adminService.getAllUsersWithDetails();
      console.log("Données utilisateurs reçues:", usersData);
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

  const filterUsers = () => {
    let filtered = [...users];

    // Filtre par rôle
    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchTerm) ||
          user.prenom?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      role: "",
      search: "",
    });
  };

  const handleUserSelect = (user) => {
    navigate(`/admin/users/details/${user.id}`);
  };

  const getUserIcon = (role) => {
    switch (role) {
      case "patient":
        return <FaUser className="text-blue-600" />;
      case "medecin":
        return <FaUserMd className="text-green-600" />;
      case "admin":
        return <FaShieldAlt className="text-purple-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getUserRoleLabel = (role) => {
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

  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
  if (currentUser && currentUser.role !== "admin") {
    return (
      <PageWrapper className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Accès interdit
                </h3>
                <p className="text-red-700 mt-1">
                  Vous devez être administrateur pour accéder à cette page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Réessayer
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600">
              Gérez tous les utilisateurs de la plateforme
            </p>
          </div>

          {/* Statistiques */}
          <UserStats stats={stats} />

          {/* Filtres */}
          <UserFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Liste des utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Utilisateurs ({filteredUsers.length})
                </h2>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Actualiser
                </button>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {users.length === 0
                      ? "Aucun utilisateur dans la base de données"
                      : "Aucun utilisateur ne correspond aux filtres sélectionnés"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          {getUserIcon(user.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {user.nom} {user.prenom}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {user.email}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              user.role === "patient"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "medecin"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {getUserRoleLabel(user.role)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Users;
