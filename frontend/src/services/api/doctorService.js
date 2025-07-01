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
     * Crée une nouvelle disponibilité pour un médecin
     * @param {number} doctorId - ID du médecin
     * @param {Object} availabilityData - Données de disponibilité (jour, heure_debut, heure_fin)
     * @returns {Promise<Object>} Disponibilité créée
     */
    createAvailability: async (doctorId, availabilityData) => {
      try {
        const data = {
          medecin_id: doctorId,
          jour: availabilityData.jour,
          heure_debut: availabilityData.heure_debut,
          heure_fin: availabilityData.heure_fin,
        };
        const response = await api.post(`/disponibilite`, data);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la création de la disponibilité:`, error);
        throw error;
      }
    },

    /**
     * Met à jour une disponibilité existante
     * @param {number} availabilityId - ID de la disponibilité
     * @param {Object} availabilityData - Données de disponibilité (jour, heure_debut, heure_fin)
     * @returns {Promise<Object>} Disponibilité mise à jour
     */
    updateAvailability: async (availabilityId, availabilityData) => {
      try {
        const response = await api.put(
          `/disponibilite/${availabilityId}`,
          availabilityData
        );
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour de la disponibilité:`,
          error
        );
        throw error;
      }
    },

    /**
     * Supprime une disponibilité
     * @param {number} availabilityId - ID de la disponibilité
     * @returns {Promise<Object>} Message de confirmation
     */
    deleteAvailability: async (availabilityId) => {
      try {
        const response = await api.delete(`/disponibilite/${availabilityId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la suppression de la disponibilité:`,
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
