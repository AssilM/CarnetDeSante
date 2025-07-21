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

  // États pour les modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  // Effet pour bloquer le scroll quand une modale est ouverte
  useEffect(() => {
    const isModalOpen = showEditModal || showDeleteModal;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup lors du démontage du composant
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showEditModal, showDeleteModal]);

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

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (userId, userData) => {
    try {
      setModalLoading(true);
      await adminService.updateUserWithDetails(userId, userData);

      // Mettre à jour la liste locale
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...userData } : u))
      );

      alert("Utilisateur modifié avec succès");
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      alert("Erreur lors de la modification de l'utilisateur");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      setModalLoading(true);
      await adminService.deleteUser(userId);

      // Mettre à jour la liste locale
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      alert("Utilisateur supprimé avec succès");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setModalLoading(false);
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
      <PageWrapper className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
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
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600">
                  Gérez tous les utilisateurs de la plateforme
                </p>
              </div>
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Utilisateurs ({filteredUsers.length})
            </h2>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-gray-600">
                {users.length === 0
                  ? "Aucun utilisateur dans la base de données"
                  : "Aucun utilisateur ne correspond aux filtres sélectionnés"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modale d'édition */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
          loading={modalLoading}
        />
      )}

      {/* Modale de suppression */}
      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={modalLoading}
        />
      )}
    </PageWrapper>
  );
};

export default Users;
