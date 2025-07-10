/**
 * Point d'entrée pour le module d'authentification
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur d'authentification
export {
  signup,
  signupPatient,
  signupMedecin,
  signin,
  signout,
  refreshToken,
  getMe,
} from "./auth.controller.js";

// Export du service d'authentification
export {
  createUser,
  authenticateUser,
  refreshUserToken,
  signoutUser,
  getCurrentUser,
  isEmailAvailable,
} from "./auth.service.js";

// Export du repository d'authentification
export {
  findByEmail,
  insertUser,
  findByIdLite,
  storeRefreshToken,
  invalidateAllRefreshTokens,
  findRefreshToken,
  deleteRefreshToken,
  isEmailTaken,
  cleanupExpiredTokens,
  countActiveSessions,
} from "./auth.repository.js";
