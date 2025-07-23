/**
 * Service pour les opérations liées aux vaccins
 * Ce service nécessite une instance API authentifiée
 */

const createVaccinService = (api) => {
  return {
    /**
     * Récupère tous les vaccins de l'utilisateur connecté
     */
    getMyVaccines: async () => {
      try {
        const response = await api.get("/vaccins");
        // L'API retourne { success: true, vaccins } donc on extrait vaccins
        return response.data.vaccins || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des vaccins:", error);
        throw error;
      }
    },

    /**
     * Récupère un vaccin par son ID
     */
    getVaccineById: async (vaccineId) => {
      try {
        const response = await api.get(`/vaccins/${vaccineId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du vaccin #${vaccineId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Crée un nouveau vaccin
     */
    createVaccine: async (vaccineData) => {
      try {
        const response = await api.post("/vaccins", vaccineData);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la création du vaccin:", error);
        throw error;
      }
    },

    /**
     * Met à jour un vaccin
     */
    updateVaccine: async (vaccineId, vaccineData) => {
      try {
        const response = await api.put(`/vaccins/${vaccineId}`, vaccineData);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour du vaccin #${vaccineId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Supprime un vaccin
     */
    deleteVaccine: async (vaccineId) => {
      try {
        const response = await api.delete(`/vaccins/${vaccineId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la suppression du vaccin #${vaccineId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Épingler/Désépingler un vaccin
     */
    togglePinned: async (vaccineId) => {
      try {
        const response = await api.patch(`/vaccins/${vaccineId}/toggle-pinned`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors du changement de statut épinglé du vaccin #${vaccineId}:`,
          error
        );
        throw error;
      }
    },
  };
};

export default createVaccinService;
