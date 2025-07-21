/**
 * Point d'entrée pour le module de gestion des utilisateurs
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur utilisateur
export {
  getAllUsers,
  getUserById,
  getMe,
  updateUser,
  updatePassword,
  deleteUser,
  getUsersByRole,
  updateUserPhotoController,
} from "./user.controller.js";

// Export du service utilisateur
export {
  getAllUsersService,
  getUserByIdService,
  getUsersByRoleService,
  updateUserService,
  updatePasswordService,
  deleteUserService,
  updateUserPhotoService,
} from "./user.service.js";

// Export du repository utilisateur
export {
  findAllUsers,
  findById,
  findByIdWithPassword,
  isEmailTaken,
  updateUser as updateUserRepo,
  updatePassword as updatePasswordRepo,
  deleteUser as deleteUserRepo,
  findByRole,
  updateUserPhotoRepo,
} from "./user.repository.js";
