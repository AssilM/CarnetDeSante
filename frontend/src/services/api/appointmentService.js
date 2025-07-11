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
     * Récupère un rendez-vous spécifique par son ID
     * @param {number|string} appointmentId - ID du rendez-vous à récupérer
     * @returns {Promise<Object>} Détails du rendez-vous
     */
    getAppointmentById: async (appointmentId) => {
      try {
        console.log(
          `[appointmentService] Récupération du rendez-vous #${appointmentId}`
        );
        const response = await api.get(`/rendez-vous/${appointmentId}`);
        console.log(
          `[appointmentService] Rendez-vous #${appointmentId} récupéré:`,
          response.data
        );
        return response.data;
      } catch (error) {
        console.error(
          `[appointmentService] Erreur lors de la récupération du rendez-vous #${appointmentId}:`,
          error
        );
        console.error("[appointmentService] Message d'erreur:", error.message);
        console.error(
          "[appointmentService] Réponse d'erreur:",
          error.response?.data
        );
        throw error;
      }
    },

    /**
     * Crée un nouveau rendez-vous
     * @param {Object} appointmentData - Données du rendez-vous
     * @param {number} appointmentData.patient_id - ID du patient
     * @param {number} appointmentData.medecin_id - ID du médecin
     * @param {string} appointmentData.date - Date au format YYYY-MM-DD
     * @param {string} appointmentData.heure - Heure au format HH:MM
     * @param {number} [appointmentData.duree=30] - Durée en minutes
     * @param {string} [appointmentData.motif] - Motif du rendez-vous
     * @param {string} [appointmentData.adresse] - Adresse du rendez-vous
     * @returns {Promise<Object>} Rendez-vous créé
     */
    createAppointment: async (appointmentData) => {
      try {
        console.log(
          "[appointmentService] Données avant envoi:",
          appointmentData
        );
        console.log("[appointmentService] Types des données:", {
          patient_id: typeof appointmentData.patient_id,
          medecin_id: typeof appointmentData.medecin_id,
          date: typeof appointmentData.date,
          heure: typeof appointmentData.heure,
          duree: typeof appointmentData.duree,
          motif: typeof appointmentData.motif,
          adresse: typeof appointmentData.adresse,
        });

        // Convertir les IDs en nombres si ce sont des chaînes
        const dataToSend = {
          ...appointmentData,
          patient_id: Number(appointmentData.patient_id),
          medecin_id: Number(appointmentData.medecin_id),
          duree: appointmentData.duree ? Number(appointmentData.duree) : 30,
        };

        console.log(
          "[appointmentService] Données après conversion:",
          dataToSend
        );

        const response = await api.post("/rendez-vous", dataToSend);
        console.log("[appointmentService] Réponse du serveur:", response.data);
        return response.data;
      } catch (error) {
        console.error(
          "[appointmentService] Erreur lors de la création du rendez-vous:",
          error
        );
        console.error("[appointmentService] Message d'erreur:", error.message);
        console.error(
          "[appointmentService] Réponse d'erreur:",
          error.response?.data
        );
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
        const response = await api.put(`/rendez-vous/${appointmentId}/annuler`);
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

    /**
     * Supprime un rendez-vous
     * @param {number|string} appointmentId - ID du rendez-vous à supprimer
     * @returns {Promise<Object>} Confirmation de la suppression
     */
    deleteAppointment: async (appointmentId) => {
      try {
        const response = await api.delete(`/rendez-vous/${appointmentId}`);
        return response.data;
      } catch (error) {
        console.error(
          `[appointmentService] Erreur lors de la suppression du rendez-vous #${appointmentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Démarre un rendez-vous (change le statut à "en_cours")
     * @param {number|string} appointmentId - ID du rendez-vous à démarrer
     * @returns {Promise<Object>} Rendez-vous mis à jour
     */
    startAppointment: async (appointmentId) => {
      try {
        console.log(
          `[appointmentService] Démarrage du rendez-vous #${appointmentId}`
        );
        const response = await api.put(
          `/rendez-vous/${appointmentId}/en-cours`
        );
        console.log(
          `[appointmentService] Rendez-vous #${appointmentId} démarré:`,
          response.data
        );
        return response.data;
      } catch (error) {
        console.error(
          `[appointmentService] Erreur lors du démarrage du rendez-vous #${appointmentId}:`,
          error
        );
        console.error("[appointmentService] Message d'erreur:", error.message);
        console.error(
          "[appointmentService] Réponse d'erreur:",
          error.response?.data
        );
        throw error;
      }
    },

    /**
     * Termine un rendez-vous (change le statut à "terminé")
     * @param {number|string} appointmentId - ID du rendez-vous à terminer
     * @returns {Promise<Object>} Rendez-vous mis à jour
     */
    finishAppointment: async (appointmentId) => {
      try {
        console.log(
          `[appointmentService] Finalisation du rendez-vous #${appointmentId}`
        );
        const response = await api.put(`/rendez-vous/${appointmentId}/termine`);
        console.log(
          `[appointmentService] Rendez-vous #${appointmentId} terminé:`,
          response.data
        );
        return response.data;
      } catch (error) {
        console.error(
          `[appointmentService] Erreur lors de la finalisation du rendez-vous #${appointmentId}:`,
          error
        );
        console.error("[appointmentService] Message d'erreur:", error.message);
        console.error(
          "[appointmentService] Réponse d'erreur:",
          error.response?.data
        );
        throw error;
      }
    },

    /**
     * Met à jour les notes du médecin pour un rendez-vous
     * @param {number|string} appointmentId - ID du rendez-vous
     * @param {string} notes - Notes à enregistrer
     * @returns {Promise<Object>} Rendez-vous mis à jour
     */
    updateDoctorNotes: async (appointmentId, notes) => {
      try {
        const response = await api.put(
          `/rendez-vous/${appointmentId}/notes-medecin`,
          { notes }
        );
        return response.data;
      } catch (error) {
        console.error(
          `[appointmentService] Erreur lors de la mise à jour des notes du médecin pour le rendez-vous #${appointmentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Met à jour la raison d'annulation pour un rendez-vous
     * @param {number|string} appointmentId - ID du rendez-vous
     * @param {string} reason - Raison d'annulation
     * @returns {Promise<Object>} Rendez-vous mis à jour
     */
    updateCancelReason: async (appointmentId, reason) => {
      try {
        const response = await api.put(
          `/rendez-vous/${appointmentId}/raison-annulation`,
          { raison: reason }
        );
        return response.data;
      } catch (error) {
        console.error(
          `[appointmentService] Erreur lors de la mise à jour de la raison d'annulation pour le rendez-vous #${appointmentId}:`,
          error
        );
        throw error;
      }
    },
  };
};

export default createAppointmentService;
