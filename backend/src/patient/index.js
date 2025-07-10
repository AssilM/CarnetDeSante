/**
 * Point d'entrée pour le module de gestion des patients
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur patient
export {
  getAllPatients,
  getProfile,
  getProfileByUserId,
  createOrUpdateProfile,
  getMedicalInfo,
  getPatientById,
  getPatientIdByUserId,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  addDocument,
  getPatientDocuments,
  getDocument,
  deleteDocument,
  downloadDocument,
  viewDocument,
} from "./patient.controller.js";

// Export du service patient
export {
  getAllPatientsService,
  getProfileService,
  getProfileByUserIdService,
  createOrUpdateProfileService,
  getMedicalInfoService,
  getPatientByIdService,
  getPatientIdByUserIdService,
  createPatientService,
  updatePatientService,
  deletePatientService,
  searchPatientsService,
  addDocumentService,
  getPatientDocumentsService,
  getDocumentService,
  deleteDocumentService,
  getDocumentForDownloadService,
} from "./patient.service.js";

// Export du repository patient
export {
  findAllPatients,
  findPatientByUserId,
  existsPatient,
  createPatient as createPatientRepo,
  updatePatient as updatePatientRepo,
  deletePatient as deletePatientRepo,
} from "./patient.repository.js";
