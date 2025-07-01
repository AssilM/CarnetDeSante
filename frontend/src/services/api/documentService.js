/**
 * Service pour les opérations liées aux documents médicaux
 * Ce service nécessite une instance API authentifiée
 */

const createDocumentService = (api) => {
  return {
    /**
     * Récupère tous les documents d'un patient
     * @param {number} patientId - ID du patient
     * @returns {Promise<Array>} Liste des documents du patient
     */
    getPatientDocuments: async (patientId) => {
      try {
        const response = await api.get(`/documents/patient/${patientId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des documents du patient #${patientId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère un document par son ID
     * @param {number} documentId - ID du document
     * @returns {Promise<Object>} Détails du document
     */
    getDocumentById: async (documentId) => {
      try {
        const response = await api.get(`/documents/${documentId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du document #${documentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Télécharge un document
     * @param {number} documentId - ID du document
     * @returns {Promise<Blob>} Contenu du document
     */
    downloadDocument: async (documentId) => {
      try {
        const response = await api.get(`/documents/${documentId}/download`, {
          responseType: "blob",
        });
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors du téléchargement du document #${documentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Crée un nouveau document
     * @param {FormData} documentData - Données du document (incluant le fichier)
     * @returns {Promise<Object>} Document créé
     */
    createDocument: async (documentData) => {
      try {
        const response = await api.post("/documents", documentData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la création du document:", error);
        throw error;
      }
    },

    /**
     * Met à jour les métadonnées d'un document
     * @param {number} documentId - ID du document
     * @param {Object} metadata - Nouvelles métadonnées du document
     * @returns {Promise<Object>} Document mis à jour
     */
    updateDocumentMetadata: async (documentId, metadata) => {
      try {
        const response = await api.put(
          `/documents/${documentId}/metadata`,
          metadata
        );
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la mise à jour des métadonnées du document #${documentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Supprime un document
     * @param {number} documentId - ID du document
     * @returns {Promise<Object>} Confirmation de la suppression
     */
    deleteDocument: async (documentId) => {
      try {
        const response = await api.delete(`/documents/${documentId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la suppression du document #${documentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Partage un document avec un médecin
     * @param {number} documentId - ID du document
     * @param {number} doctorId - ID du médecin
     * @returns {Promise<Object>} Confirmation du partage
     */
    shareDocumentWithDoctor: async (documentId, doctorId) => {
      try {
        const response = await api.post(`/documents/${documentId}/share`, {
          medecin_id: doctorId,
        });
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors du partage du document #${documentId}:`,
          error
        );
        throw error;
      }
    },

    /**
     * Récupère les documents partagés avec un médecin
     * @param {number} doctorId - ID du médecin
     * @returns {Promise<Array>} Liste des documents partagés
     */
    getDocumentsSharedWithDoctor: async (doctorId) => {
      try {
        const response = await api.get(`/documents/shared/medecin/${doctorId}`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des documents partagés:`,
          error
        );
        throw error;
      }
    },
  };
};

export default createDocumentService;
