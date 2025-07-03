import { httpService } from '../http/httpService';

// Service pour gérer les vaccins
export const vaccinService = {
  // Récupérer tous les vaccins d'un patient
  getVaccins: async (patientId) => {
    try {
      const response = await httpService.get(`/vaccin/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des vaccins:', error);
      // Retourner une structure de données cohérente même en cas d'erreur
      if (error.response?.status === 404) {
        return { success: true, data: [], message: 'Aucun vaccin trouvé' };
      }
      return { success: false, data: [], message: error.message };
    }
  },

  // Récupérer un vaccin spécifique
  getVaccinById: async (id) => {
    try {
      const response = await httpService.get(`/vaccin/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du vaccin:', error);
      return { success: false, data: null, message: error.message };
    }
  },

  // Créer un nouveau vaccin
  createVaccin: async (vaccinData) => {
    try {
      const response = await httpService.post('/vaccin', vaccinData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du vaccin:', error);
      return { 
        success: false, 
        data: null, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  // Mettre à jour un vaccin
  updateVaccin: async (id, vaccinData) => {
    try {
      const response = await httpService.put(`/vaccin/${id}`, vaccinData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du vaccin:', error);
      throw error;
    }
  },

  // Supprimer un vaccin
  deleteVaccin: async (id) => {
    try {
      const response = await httpService.delete(`/vaccin/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du vaccin:', error);
      throw error;
    }
  },

  // Récupérer les vaccins par statut
  getVaccinsByStatut: async (patientId, statut) => {
    try {
      const response = await httpService.get(`/vaccin/patient/${patientId}/statut/${statut}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des vaccins par statut:', error);
      throw error;
    }
  }
};

export default vaccinService;
