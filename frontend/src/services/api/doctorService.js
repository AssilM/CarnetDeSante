/**
 * Service pour les opérations liées aux médecins
 * Ce service nécessite une instance API authentifiée
 */

const createDoctorService = (api) => {
  return {
    /**
     * Récupère la liste de tous les médecins
     * @returns {Promise<Array>} Liste des médecins
     */
    getAllDoctors: async () => {
      try {
        const response = await api.get("/medecin");
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération des médecins:`, error);
        throw error;
      }
    },

    /**
     * Récupère un médecin par son ID utilisateur
     * @param {number} userId - ID de l'utilisateur/médecin
     * @returns {Promise<Object>} Données du médecin
     */
    getDoctorById: async (userId) => {
      try {
        const response = await api.get(`/medecin/${userId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du médecin #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Recherche des médecins par spécialité, nom ou prénom
     * @param {string} query - Terme de recherche
     * @returns {Promise<Array>} Liste des médecins correspondants
     */
    searchDoctors: async (query) => {
      try {
        const response = await api.get(
          `/medecin/search?q=${encodeURIComponent(query)}`
        );
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la recherche de médecins:`, error);
        throw error;
      }
    },

    /**
     * Récupère le profil du médecin connecté
     * @returns {Promise<Object>} Profil du médecin
     */
    getDoctorProfile: async () => {
      try {
        const response = await api.get(`/medecin/profile`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du profil médecin:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère le profil d'un médecin par son ID utilisateur
     * @param {number} userId - ID de l'utilisateur/médecin
     * @returns {Promise<Object>} Profil du médecin
     */
    getDoctorProfileByUserId: async (userId) => {
      try {
        const response = await api.get(`/medecin/${userId}`);
        return { medecin: response.data };
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du profil médecin #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Crée ou met à jour le profil d'un médecin
     * @param {number} userId - ID de l'utilisateur
     * @param {Object} profileData - Données du profil
     * @returns {Promise<Object>} Profil mis à jour
     */
    createOrUpdateDoctorProfile: async (userId, profileData) => {
      try {
        const data = { ...profileData, utilisateur_id: userId };
        const response = await api.post(`/medecin/profile`, data);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour du profil médecin:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère les disponibilités d'un médecin
     * @param {number} userId - ID de l'utilisateur/médecin
     * @returns {Promise<Array>} Disponibilités du médecin
     */
    getDoctorAvailability: async (userId) => {
      try {
        const response = await api.get(`/disponibilite/medecin/${userId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des disponibilités:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère les médecins par spécialité
     * @param {string} specialty - Spécialité médicale
     * @returns {Promise<Array>} Liste des médecins de cette spécialité
     */
    getDoctorsBySpecialty: async (specialty) => {
      try {
        const response = await api.get(`/medecin/specialite/${specialty}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des médecins par spécialité:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère les créneaux disponibles pour un médecin à une date donnée
     * @param {number} doctorId - ID du médecin
     * @param {string} date - Date au format YYYY-MM-DD
     * @returns {Promise<Array>} Liste des créneaux disponibles
     */
    getAvailableSlots: async (doctorId, date) => {
      try {
        const response = await api.get(
          `/disponibilite/medecin/${doctorId}/creneaux`,
          {
            params: { date },
          }
        );
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des créneaux disponibles:`,
          error
        );
        throw error;
      }
    },
  };
};

export default createDoctorService;
