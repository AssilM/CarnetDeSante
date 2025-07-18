/**
 * Point d'entrée pour le module d'administration
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur admin
export {
  getAllAdministrateurs,
  getAdministrateurById,
  updateAdministrateur,
  deleteAdministrateur,
  getDashboardStats,
  // Gestion des utilisateurs côté admin
  getAllUsers,
  getAllUsersWithDetails,
  getUserById,
  getUserByIdWithDetails,
  getUsersByRole,
  updateUser,
  deleteUser,
  // Gestion des documents côté admin
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentsByType,
} from "./admin.controller.js";

// Export du service admin
export {
  getAllAdministrateursService,
  getAdministrateurByUserIdService,
  isUserAdministrateurService,
  updateAdministrateurNiveauAccesService,
  deleteAdministrateurService,
  getDashboardStatsService,
  // Services de gestion des utilisateurs côté admin
  getAllUsersAdminService,
  getAllUsersWithDetailsAdminService,
  getUserByIdAdminService,
  getUserByIdWithDetailsAdminService,
  getUsersByRoleAdminService,
  updateUserAdminService,
  deleteUserAdminService,
  // Services de gestion des documents côté admin
  getAllDocumentsAdminService,
  getDocumentByIdAdminService,
  deleteDocumentAdminService,
  getDocumentsByTypeAdminService,
} from "./admin.service.js";

// Export du repository admin
export {
  findAllAdministrateurs,
  findAdministrateurByUserId,
  isUserAdministrateur,
  updateAdministrateurNiveauAcces,
  deleteAdministrateur,
  getDashboardStats,
  // Fonctions de gestion des documents côté admin
  findAllDocumentsAdmin,
  findDocumentByIdAdmin,
  deleteDocumentAdmin,
  findDocumentsByTypeAdmin,
} from "./admin.repository.js";
