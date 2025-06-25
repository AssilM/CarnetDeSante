/**
 * API pour les opérations CRUD des utilisateurs
 */

// Cette fonction sera utilisée pour créer les méthodes d'API avec l'instance axios authentifiée
const createUserApi = (api) => {
  return {
    /**
     * Récupérer tous les utilisateurs (admin uniquement)
     */
    getAllUsers: async () => {
      const response = await api.get("/users");
      return response.data;
    },

    /**
     * Récupérer un utilisateur par son ID
     */
    getUserById: async (userId) => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },

    /**
     * Récupérer les utilisateurs par rôle (admin uniquement)
     */
    getUsersByRole: async (role) => {
      const response = await api.get(`/users/role/${role}`);
      return response.data;
    },

    /**
     * Mettre à jour les informations d'un utilisateur
     */
    updateUser: async (userId, userData) => {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    },

    /**
     * Mettre à jour le mot de passe d'un utilisateur
     */
    updatePassword: async (userId, { currentPassword, newPassword }) => {
      const response = await api.put(`/users/${userId}/password`, {
        currentPassword,
        newPassword,
      });
      return response.data;
    },

    /**
     * Supprimer un utilisateur (admin uniquement)
     */
    deleteUser: async (userId) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
  };
};

export default createUserApi;
