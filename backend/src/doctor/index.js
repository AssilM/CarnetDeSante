/**
 * Point d'entrée pour le module de gestion des médecins
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur médecin
export {
  getAllMedecins,
  getMedecinById,
  getProfile,
  createOrUpdateProfile,
  searchMedecins,
  getMedecinIdByUserId,
  getMedecinsBySpecialite,
  getAllSpecialites,
} from "./medecin.controller.js";

// Export du service médecin
export {
  getAllMedecinsService,
  getMedecinByIdService,
  getProfileService,
  createOrUpdateProfileService,
  searchMedecinsService,
  getMedecinIdByUserIdService,
  getMedecinsBySpecialiteService,
  getAllSpecialitesService,
} from "./medecin.service.js";

// Export du repository médecin
export {
  findAllMedecins,
  findMedecinByUserId,
  existsMedecin,
  createMedecin,
  updateMedecin,
  searchMedecins as searchMedecinsRepo,
  findMedecinsBySpecialite,
  getAllSpecialites as getAllSpecialitesRepo,
} from "./medecin.repository.js";
