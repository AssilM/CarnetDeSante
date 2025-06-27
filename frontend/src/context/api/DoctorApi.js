import { baseApi } from "../../services/api";

// API pour les opérations liées aux médecins
const DoctorApi = {
  // Créer ou mettre à jour le profil médecin
  createOrUpdateProfile: async (userId, doctorData, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await baseApi.post(
        "/medecin/profile",
        {
          utilisateur_id: userId,
          ...doctorData,
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la création/mise à jour du profil médecin:",
        error
      );
      throw error;
    }
  },

  // Récupérer le profil d'un médecin
  getProfile: async (userId, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await baseApi.get(`/medecin/profile/${userId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil médecin:", error);
      throw error;
    }
  },

  // Récupérer tous les médecins
  getAllDoctors: async () => {
    try {
      const response = await baseApi.get("/medecin");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des médecins:", error);
      throw error;
    }
  },

  // Récupérer les médecins par spécialité
  getDoctorsBySpecialty: async (specialite) => {
    try {
      const response = await baseApi.get(`/medecin/specialite/${specialite}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des médecins par spécialité:",
        error
      );
      throw error;
    }
  },
};

export default DoctorApi;
