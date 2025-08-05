/**
 * Point d'entrée pour tous les services API
 * Permet d'importer facilement tous les services depuis un seul fichier
 */

import authService from "./authService";
import createUserService from "./userService";
import createDoctorService from "./doctorService";
import createPatientService from "./patientService";
import createAppointmentService from "./appointmentService";
import createDocumentService from "./documentService";
import createVaccinService from "./vaccinService";
import createUserPhotoService from "./userPhotoService";
import { getAllSpecialites } from "./specialiteService";
import * as adminService from "./adminService";
import createMessagingService from "./messagingService";

// Pour la compatibilité avec le code existant
export const authApi = {
  login: authService.login,
  register: authService.register,
  logout: authService.logout,
  refreshToken: authService.refreshToken,
};

export {
  authService,
  createUserService,
  createDoctorService,
  createPatientService,
  createAppointmentService,
  createDocumentService,
  createVaccinService,
  createUserPhotoService,
  getAllSpecialites,
  adminService,
  createMessagingService,
};
