/**
 * Service pour les opérations CRUD sur les utilisateurs
 * Ce service nécessite une instance API authentifiée
 */

const createUserService = (api) => {
  return {
    /**
     * Récupère l'utilisateur actuellement connecté
     * @returns {Promise<Object>} Données de l'utilisateur courant
     */
    getCurrentUser: async () => {
      try {
        const response = await api.get("/auth/me");
        return response.data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur courant:",
          error
        );
        throw error;
      }
    },

    /**
     * Récupère tous les utilisateurs (admin uniquement)
     * @returns {Promise<Array>} Liste des utilisateurs
     */
    getAllUsers: async () => {
      try {
        const response = await api.get("/user");
        return response.data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
        throw error;
      }
    },

    /**
     * Alias pour getAllUsers pour compatibilité
     */
    getAll: async () => {
      try {
        const response = await api.get("/user");
        return response.data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
        throw error;
      }
    },

    /**
     * Récupère un utilisateur par son ID
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} Données de l'utilisateur
     */
    getUserById: async (userId) => {
      try {
        const response = await api.get(`/user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération de l'utilisateur #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Alias pour getUserById pour compatibilité
     */
    getById: async (userId) => {
      try {
        const response = await api.get(`/user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération de l'utilisateur #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère les utilisateurs par rôle
     * @param {string} role - Rôle des utilisateurs à récupérer
     * @returns {Promise<Array>} Liste des utilisateurs avec ce rôle
     */
    getUsersByRole: async (role) => {
      try {
        const response = await api.get(`/user/role/${role}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des utilisateurs avec le rôle ${role}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Alias pour getUsersByRole pour compatibilité
     */
    getByRole: async (role) => {
      try {
        const response = await api.get(`/user/role/${role}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des utilisateurs avec le rôle ${role}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Met à jour les informations d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {Object} userData - Nouvelles données de l'utilisateur
     * @returns {Promise<Object>} Données mises à jour
     */
    updateUser: async (userId, userData) => {
      try {
        const response = await api.put(`/user/${userId}`, userData);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour de l'utilisateur #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Alias pour updateUser pour compatibilité
     */
    update: async (userId, userData) => {
      try {
        const response = await api.put(`/user/${userId}`, userData);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour de l'utilisateur #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Met à jour le mot de passe d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {Object} passwordData - Ancien et nouveau mot de passe
     * @returns {Promise<Object>} Confirmation de la mise à jour
     */
    updatePassword: async (userId, { currentPassword, newPassword }) => {
      try {
        const response = await api.put(`/user/${userId}/password`, {
          currentPassword,
          newPassword,
        });
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du mot de passe:`, error);
        throw error;
      }
    },

    /**
     * Supprime un utilisateur
     * @param {number} userId - ID de l'utilisateur à supprimer
     * @returns {Promise<Object>} Confirmation de la suppression
     */
    deleteUser: async (userId) => {
      try {
        const response = await api.delete(`/user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la suppression de l'utilisateur #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Alias pour deleteUser pour compatibilité
     */
    delete: async (userId) => {
      try {
        const response = await api.delete(`/user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la suppression de l'utilisateur #${userId}:`,
          error
        );
        throw error;
      }
    },
  };
};

export default createUserService;
