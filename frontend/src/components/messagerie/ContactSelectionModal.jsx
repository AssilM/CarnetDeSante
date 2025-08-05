import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createMessagingService } from "../../services/api";
import { httpService } from "../../services";
import { FaSearch, FaUserMd, FaUser, FaTimes } from "react-icons/fa";

const messagingService = createMessagingService(httpService);

const ContactSelectionModal = ({ isOpen, onClose, onContactSelect }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Charger les utilisateurs disponibles
  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen]);

  // Filtrer les utilisateurs quand la recherche change
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getAvailableUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Impossible de charger les utilisateurs disponibles");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtre par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nom?.toLowerCase().includes(term) ||
          user.prenom?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.specialite?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleContactSelect = (user) => {
    onContactSelect(user);
    onClose();
  };

  const getUserIcon = (role) => {
    return role === "medecin" ? (
      <FaUserMd className="text-blue-600" />
    ) : (
      <FaUser className="text-green-600" />
    );
  };

  const getUserRoleLabel = (role) => {
    return role === "medecin" ? "Médecin" : "Patient";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Créer une conversation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun utilisateur trouvé"
                  : "Aucun utilisateur disponible"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleContactSelect(user)}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    {user.chemin_photo ? (
                      <img
                        src={user.chemin_photo}
                        alt={`${user.prenom} ${user.nom}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        {getUserIcon(user.role)}
                      </div>
                    )}
                  </div>

                  {/* Informations utilisateur */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user.prenom} {user.nom}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.specialite && (
                          <p className="text-xs text-blue-600 mt-1">
                            {user.specialite}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getUserRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSelectionModal;
