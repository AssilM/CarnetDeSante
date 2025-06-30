/**
 * Service pour les opérations liées aux rendez-vous médicaux
 * Ce service nécessite une instance API authentifiée
 */

const createAppointmentService = (api) => {
  return {
    /**
     * Récupère tous les rendez-vous d'un patient
     * @param {number} patientId - ID du patient
     * @returns {Promise<Array>} Liste des rendez-vous du patient
     */
    getPatientAppointments: async (patientId) => {
      try {
        const response = await api.get(`/rendez-vous/patient/${patientId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des rendez-vous du patient #${patientId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère tous les rendez-vous d'un médecin
     * @param {number} doctorId - ID du médecin
     * @returns {Promise<Array>} Liste des rendez-vous du médecin
     */
    getDoctorAppointments: async (doctorId) => {
      try {
        const response = await api.get(`/rendez-vous/medecin/${doctorId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des rendez-vous du médecin #${doctorId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère les détails d'un rendez-vous
     * @param {number} appointmentId - ID du rendez-vous
     * @returns {Promise<Object>} Détails du rendez-vous
     */
    getAppointmentById: async (appointmentId) => {
      try {
        const response = await api.get(`/rendez-vous/${appointmentId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du rendez-vous #${appointmentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Crée un nouveau rendez-vous
     * @param {Object} appointmentData - Données du rendez-vous
     * @returns {Promise<Object>} Rendez-vous créé
     */
    createAppointment: async (appointmentData) => {
      try {
        const response = await api.post("/rendez-vous", appointmentData);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la création du rendez-vous:", error);
        throw error;
      }
    },

    /**
     * Met à jour un rendez-vous existant
     * @param {number} appointmentId - ID du rendez-vous
     * @param {Object} appointmentData - Nouvelles données du rendez-vous
     * @returns {Promise<Object>} Rendez-vous mis à jour
     */
    updateAppointment: async (appointmentId, appointmentData) => {
      try {
        const response = await api.put(
          `/rendez-vous/${appointmentId}`,
          appointmentData
        );
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour du rendez-vous #${appointmentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Annule un rendez-vous
     * @param {number} appointmentId - ID du rendez-vous
     * @returns {Promise<Object>} Confirmation de l'annulation
     */
    cancelAppointment: async (appointmentId) => {
      try {
        const response = await api.put(`/rendez-vous/${appointmentId}/cancel`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de l'annulation du rendez-vous #${appointmentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Confirme un rendez-vous
     * @param {number} appointmentId - ID du rendez-vous
     * @returns {Promise<Object>} Confirmation du rendez-vous
     */
    confirmAppointment: async (appointmentId) => {
      try {
        const response = await api.put(`/rendez-vous/${appointmentId}/confirm`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la confirmation du rendez-vous #${appointmentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Vérifie la disponibilité d'un créneau pour un médecin
     * @param {number} doctorId - ID du médecin
     * @param {string} date - Date au format YYYY-MM-DD
     * @param {string} time - Heure au format HH:MM
     * @returns {Promise<Object>} Statut de disponibilité
     */
    checkSlotAvailability: async (doctorId, date, time) => {
      try {
        const response = await api.get(`/rendez-vous/check-availability`, {
          params: { medecin_id: doctorId, date, heure: time },
        });
        return response.data;
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de disponibilité:",
          error
        );
        throw error;
      }
    },
  };
};

export default createAppointmentService;
