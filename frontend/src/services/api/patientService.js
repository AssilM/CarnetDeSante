/**
 * Service pour les opérations liées aux patients
 * Ce service nécessite une instance API authentifiée
 */

const createPatientService = (api) => {
  return {
    /**
     * Récupère le profil patient associé à un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} Profil patient de l'utilisateur
     */
    getPatientProfileByUserId: async (userId) => {
      try {
        // Avec la nouvelle structure, l'ID utilisateur est directement l'ID patient
        const response = await api.get(`/patient/${userId}`);

        // Reformater la réponse pour être compatible avec l'interface existante
        return { patient: response.data };
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du profil patient pour l'utilisateur #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère les informations médicales du patient connecté
     * @returns {Promise<Object>} Informations médicales du patient
     */
    getMedicalInfo: async () => {
      try {
        const response = await api.get(`/patient/medical-info`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des informations médicales:`,
          error
        );
        throw error;
      }
    },

    /**
     * Crée ou met à jour le profil d'un patient
     * @param {number} userId - ID de l'utilisateur
     * @param {Object} profileData - Données du profil à créer/mettre à jour
     * @returns {Promise<Object>} Profil patient créé/mis à jour
     */
    createOrUpdatePatientProfile: async (userId, profileData) => {
      try {
        const data = { ...profileData, utilisateur_id: userId };
        const response = await api.post("/patient/profile", data);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la création/mise à jour du profil patient:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère un patient par son ID (qui est désormais l'ID utilisateur)
     * @param {number} userId - ID de l'utilisateur/patient
     * @returns {Promise<Object>} Données du patient
     */
    getPatientById: async (userId) => {
      try {
        const response = await api.get(`/patient/${userId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du patient #${userId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Met à jour les informations médicales d'un patient
     * @param {number} userId - ID de l'utilisateur/patient
     * @param {Object} medicalData - Données médicales à mettre à jour
     * @returns {Promise<Object>} Données médicales mises à jour
     */
    updateMedicalInfo: async (userId, medicalData) => {
      try {
        const response = await api.put(
          `/patient/${userId}/medical-info`,
          medicalData
        );
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour des informations médicales:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère l'historique médical d'un patient
     * @param {number} userId - ID de l'utilisateur/patient
     * @returns {Promise<Array>} Historique médical du patient
     */
    getMedicalHistory: async (userId) => {
      try {
        const response = await api.get(`/patient/${userId}/medical-history`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération de l'historique médical:`,
          error
        );
        throw error;
      }
    },

    /**
     * Ajoute un élément à l'historique médical d'un patient
     * @param {number} userId - ID de l'utilisateur/patient
     * @param {Object} historyItem - Élément d'historique à ajouter
     * @returns {Promise<Object>} Élément d'historique créé
     */
    addMedicalHistoryItem: async (userId, historyItem) => {
      try {
        const response = await api.post(
          `/patient/${userId}/medical-history`,
          historyItem
        );
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de l'ajout à l'historique médical:`, error);
        throw error;
      }
    },

    /**
     * Récupère les allergies d'un patient
     * @param {number} userId - ID de l'utilisateur/patient
     * @returns {Promise<Array>} Liste des allergies du patient
     */
    getAllergies: async (userId) => {
      try {
        const response = await api.get(`/patient/${userId}/allergies`);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération des allergies:`, error);
        throw error;
      }
    },

    /**
     * Ajoute une allergie au profil d'un patient
     * @param {number} userId - ID de l'utilisateur/patient
     * @param {Object} allergyData - Données de l'allergie
     * @returns {Promise<Object>} Allergie créée
     */
    addAllergy: async (userId, allergyData) => {
      try {
        const response = await api.post(
          `/patient/${userId}/allergies`,
          allergyData
        );
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de l'ajout d'une allergie:`, error);
        throw error;
      }
    },
  };
};

export default createPatientService;
