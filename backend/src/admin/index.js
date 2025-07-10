/**
 * Point d'entrée pour le module d'administration
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur admin
export {
  getAllAdministrateurs,
  getAdministrateurById,
  getAdminIdByUserId,
  updateAdministrateur,
  deleteAdministrateur,
  getDashboardStats,
  getSystemStatus,
  manageUsers,
} from "./admin.controller.js";
