/**
 * Point d'entrée pour les services partagés/transversaux
 * Centralise les services utilisés par plusieurs modules
 */

// Services de validation des entités
export {
  validatePatientExists,
  validateDoctorExists,
  validateEntitiesExistence,
} from "./validation.service.js";
