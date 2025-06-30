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

import { createAuthConnector } from "./http";
import { httpService } from "./http";

// Pour la compatibilité avec le code existant
export const baseApi = httpService;

// Pour la compatibilité avec le code existant
export const createAuthenticatedApi = (options) => {
  return createAuthConnector(options);
};

// Pour la compatibilité avec le code existant
export const createApiService = (api) => {
  return {
    users: createUserService(api),
    doctors: createDoctorService(api),
    patients: createPatientService(api),
    appointments: createAppointmentService(api),
    documents: createDocumentService(api),
  };
};

/**
 * Crée tous les services API nécessaires avec une instance API authentifiée
 * @param {Object} api - Instance API authentifiée
 * @returns {Object} Tous les services API configurés
 */
export const createServices = (api) => {
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
