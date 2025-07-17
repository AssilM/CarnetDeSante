/**
 * Service pour les opérations liées aux documents médicaux
 * Ce service nécessite une instance API authentifiée
 */

const createDocumentService = (api) => {
  return {
    /**
     * Récupère tous les documents accessibles à l'utilisateur connecté
     */
    getMyDocuments: async () => {
      try {
        const response = await api.get("/documents");
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des documents:", error);
        throw error;
      }
    },

    /**
     * Récupère un document par son ID
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
     * Supprime un document
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
     * Récupère les documents partagés par un patient donné au médecin connecté
     */
    getDocumentsSharedByPatient: async (patientId) => {
      try {
        const response = await api.get(
          `/documents/shared-by-patient/${patientId}`
        );
        return response.data;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des documents partagés par le patient:",
          error
        );
        throw error;
      }
    },

    /**
     * Récupère la liste des médecins ayant accès à un document
     */
    getDocumentDoctorsWithAccess: async (documentId) => {
      try {
        const response = await api.get(`/documents/${documentId}/permissions`);
        return response.data;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des permissions du document #${documentId}:`,
          error
        );
        throw error;
      }
    },
  };
};

export default createDocumentService;
