/**
 * Point d'entrée pour le module de gestion des rendez-vous
 * Centralise tous les exports pour faciliter les imports
 */

// Export du contrôleur rendez-vous
export {
  getAllRendezVous,
  getRendezVousById,
  getRendezVousByPatientId,
  getRendezVousByMedecinId,
  createRendezVous,
  updateRendezVous,
  cancelRendezVous,
  deleteRendezVous,
} from "./rendezvous.controller.js";

// Export du service rendez-vous
export {
  getAllRendezVousService,
  getRendezVousByIdService,
  getRendezVousByPatientIdService,
  getRendezVousByMedecinIdService,
  createRendezVousService,
  updateRendezVousService,
  cancelRendezVousService,
  deleteRendezVousService,
  checkDoctorAvailabilityService,
  checkAppointmentConflictService,
  verifierDisponibiliteMedecinService,
} from "./rendezvous.service.js";

// Export du repository rendez-vous
export {
  findAllRendezVous,
  findRendezVousById,
  findRendezVousByPatientId,
  findRendezVousByMedecinId,
  createRendezVous as createRendezVousRepo,
  updateRendezVous as updateRendezVousRepo,
  cancelRendezVous as cancelRendezVousRepo,
  deleteRendezVous as deleteRendezVousRepo,
  checkRendezVousConflict,
  findAppointmentsByMedecinAndDate,
} from "./rendezvous.repository.js";
