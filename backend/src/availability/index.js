/**
 * Point d'entrée pour le module de gestion des disponibilités
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur disponibilité
export {
  getDisponibilitesByMedecinId,
  createDisponibilite,
  updateDisponibilite,
  deleteDisponibilite,
  getCreneauxDisponibles,
} from "./disponibilite.controller.js";

// Export du service disponibilité
export {
  getDisponibilitesByMedecinService,
  createDisponibiliteService,
  updateDisponibiliteService,
  deleteDisponibiliteService,
  getCreneauxDisponiblesService,
} from "./disponibilite.service.js";

// Export du repository disponibilité
export {
  findDisponibilitesByMedecinId,
  checkMedecinExists,
  checkDisponibiliteOverlap,
  createDisponibilite as createDisponibiliteRepo,
  findDisponibiliteById,
  updateDisponibilite as updateDisponibiliteRepo,
  deleteDisponibilite as deleteDisponibiliteRepo,
  findDisponibilitesByJour,
} from "./disponibilite.repository.js";
