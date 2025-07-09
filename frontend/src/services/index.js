/**
 * Point d'entrée principal pour tous les services
 * Permet d'importer facilement tous les services depuis un seul fichier
 */

// Exporter les services HTTP
export * from "./http";

// Exporter les services API
export * from "./api";

// Importer les créateurs de services
import {
  createUserService,
  createDoctorService,
  createPatientService,
  createAppointmentService,
  createDocumentService,
} from "./api";

import { httpService } from "./http";

// Pour la compatibilité avec le code existant
export const baseApi = httpService;

/**
 * ✅ SIMPLIFIÉ : Plus besoin de createAuthConnector !
 * Tous les services utilisent maintenant httpService directement
 */
export const createApiService = (api = httpService) => {
  return {
    users: createUserService(api),
    doctors: createDoctorService(api),
    patients: createPatientService(api),
    appointments: createAppointmentService(api),
    documents: createDocumentService(api),
  };
};

/**
 * Crée tous les services API nécessaires avec httpService (gestion automatique des tokens)
 * @param {Object} api - Instance API (par défaut: httpService)
 * @returns {Object} Tous les services API configurés
 */
export const createServices = (api = httpService) => {
  // Créer et retourner tous les services
  return {
    userService: createUserService(api),
    doctorService: createDoctorService(api),
    patientService: createPatientService(api),
    appointmentService: createAppointmentService(api),
    documentService: createDocumentService(api),
  };
};

export default createServices;
