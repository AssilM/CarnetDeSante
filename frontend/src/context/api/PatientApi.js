import { baseApi } from "../../services/api";

// API pour les opérations liées aux patients
const PatientApi = {
  // Créer ou mettre à jour le profil patient
  createOrUpdateProfile: async (userId, patientData, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await baseApi.post(
        "/patients/profile",
        {
          utilisateur_id: userId,
          ...patientData,
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la création/mise à jour du profil patient:",
        error
      );
      throw error;
    }
  },

  // Récupérer le profil d'un patient
  getProfile: async (userId, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await baseApi.get(`/patients/profile/${userId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil patient:", error);
      throw error;
    }
  },

  // Récupérer les informations médicales du patient connecté
  getMedicalInfo: async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await baseApi.get("/patients/medical-info", { headers });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations médicales:",
        error
      );
      throw error;
    }
  },
};

export default PatientApi;
