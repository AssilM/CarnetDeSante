import {
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
  startAppointmentService,
  finishAppointmentService,
  updateNotesMedecinService,
  updateRaisonAnnulationService,
} from "./rendezvous.service.js";
import {
  validatePatientExists,
  validateDoctorExists,
} from "../shared/index.js";

/**
 * Controller pour la gestion des rendez-vous
 * Orchestre les requêtes HTTP et utilise les services
 */

// Récupérer tous les rendez-vous
export const getAllRendezVous = async (req, res, next) => {
  try {
    const rendezVous = await getAllRendezVousService();
    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    next(error);
  }
};

// Récupérer un rendez-vous par son ID
export const getRendezVousById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.userId;
    const requesterRole = req.userRole;

    const rdv = await getRendezVousByIdService(id, requesterId, requesterRole);

    if (!rdv) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.status(200).json(rdv);
  } catch (error) {
    console.error("Erreur lors de la récupération du rendez-vous:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Accès non autorisé") {
      return res.status(403).json({ message: error.message });
    }

    next(error);
  }
};

// Récupérer les rendez-vous par patient ID
export const getRendezVousByPatientId = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const rendezVous = await getRendezVousByPatientIdService(patientId);
    res.status(200).json(rendezVous);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du patient:",
      error
    );
    next(error);
  }
};

// Récupérer les rendez-vous par médecin ID
export const getRendezVousByMedecinId = async (req, res, next) => {
  try {
    const { medecinId } = req.params;
    const rendezVous = await getRendezVousByMedecinIdService(medecinId);
    res.status(200).json(rendezVous);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du médecin:",
      error
    );
    next(error);
  }
};

// Créer un nouveau rendez-vous
export const createRendezVous = async (req, res, next) => {
  try {
    const rdvData = req.body;
    const { patient_id, medecin_id, date, heure, duree = 30 } = rdvData;

    console.log("[createRendezVous] Validation des entités et disponibilités");

    // 1. ✅ NOUVELLE VALIDATION : Vérifier existence des entités (déplacé depuis middleware)
    const [patientExists, doctorExists] = await Promise.all([
      validatePatientExists(patient_id),
      validateDoctorExists(medecin_id),
    ]);

    if (!patientExists) {
      return res.status(400).json({
        message: "Patient non trouvé",
        field: "patient_id",
      });
    }

    if (!doctorExists) {
      return res.status(400).json({
        message: "Médecin non trouvé",
        field: "medecin_id",
      });
    }

    // 2. ✅ NOUVELLE VALIDATION : Vérifier disponibilité médecin (déplacé depuis middleware)
    const availabilityCheck = await checkDoctorAvailabilityService(
      medecin_id,
      date,
      heure
    );
    if (!availabilityCheck.available) {
      return res.status(400).json({
        message: `Le médecin n'est pas disponible le ${availabilityCheck.jour} à ${heure}`,
        field: "heure",
      });
    }

    // 3. ✅ NOUVELLE VALIDATION : Vérifier conflits de rendez-vous (déplacé depuis middleware)
    const conflictCheck = await checkAppointmentConflictService(
      medecin_id,
      date,
      heure,
      duree
    );
    if (conflictCheck.hasConflict) {
      return res.status(400).json({
        message: "Ce créneau est déjà réservé",
        field: "heure",
        conflictingAppointments: conflictCheck.conflictingAppointments,
      });
    }

    // 4. Créer le rendez-vous via le service
    const newRendezVous = await createRendezVousService(rdvData);
    console.log("[createRendezVous] Rendez-vous créé avec succès");

    res.status(201).json(newRendezVous);
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error);

    // Gestion spécifique des erreurs métier
    if (error.message.includes("aujourd'hui ou une date passée")) {
      return res.status(400).json({ message: error.message });
    }
    if (
      error.message.includes("identifiants") &&
      error.message.includes("n'existe pas")
    ) {
      return res.status(400).json({
        message: error.message,
        detail: "Vérifiez les IDs patient et médecin",
      });
    }
    if (error.message === "Ce rendez-vous existe déjà") {
      return res.status(400).json({
        message: error.message,
        detail: "Un rendez-vous identique existe déjà",
      });
    }

    next(error);
  }
};

// Mettre à jour un rendez-vous
export const updateRendezVous = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { patient_id, medecin_id, date, heure, duree = 30 } = updateData;

    // ✅ VALIDATION CONDITIONNELLE : Si des données critiques sont modifiées
    if (patient_id || medecin_id || date || heure) {
      console.log("[updateRendezVous] Validation des modifications critiques");

      // 1. Vérifier existence des entités (si modifiées)
      if (patient_id) {
        const patientExists = await validatePatientExists(patient_id);
        if (!patientExists) {
          return res.status(400).json({
            message: "Patient non trouvé",
            field: "patient_id",
          });
        }
      }

      if (medecin_id) {
        const doctorExists = await validateDoctorExists(medecin_id);
        if (!doctorExists) {
          return res.status(400).json({
            message: "Médecin non trouvé",
            field: "medecin_id",
          });
        }
      }

      // 2. Vérifier disponibilité et conflits (si date/heure modifiées)
      if (date && heure && medecin_id) {
        const availabilityCheck = await checkDoctorAvailabilityService(
          medecin_id,
          date,
          heure
        );
        if (!availabilityCheck.available) {
          return res.status(400).json({
            message: `Le médecin n'est pas disponible le ${availabilityCheck.jour} à ${heure}`,
            field: "heure",
          });
        }

        const conflictCheck = await checkAppointmentConflictService(
          medecin_id,
          date,
          heure,
          duree,
          id
        );
        if (conflictCheck.hasConflict) {
          return res.status(400).json({
            message: "Ce créneau est déjà réservé",
            field: "heure",
            conflictingAppointments: conflictCheck.conflictingAppointments,
          });
        }
      }
    }

    const updatedRendezVous = await updateRendezVousService(id, updateData);
    res.status(200).json(updatedRendezVous);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Rendez-vous non trouvé") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("n'est pas disponible")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Ce créneau est déjà réservé") {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

// Annuler un rendez-vous
export const cancelRendezVous = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cancelledRdv = await cancelRendezVousService(id);

    if (!cancelledRdv) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.status(200).json({
      message: "Rendez-vous annulé avec succès",
      rendezVous: cancelledRdv,
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous:", error);
    next(error);
  }
};

// Supprimer un rendez-vous (admin ou patient concerné)
export const deleteRendezVous = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await deleteRendezVousService(id);

    if (!success) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.status(200).json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous:", error);
    next(error);
  }
};

/**
 * Démarre un rendez-vous (changement de statut vers "en_cours")
 */
export const startAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedAppointment = await startAppointmentService(id);

    res.status(200).json({
      message: "Rendez-vous démarré avec succès",
      rendezVous: updatedAppointment,
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du rendez-vous:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Rendez-vous non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message.startsWith("Impossible de démarrer")) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

/**
 * Termine un rendez-vous (changement de statut vers "terminé")
 */
export const finishAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedAppointment = await finishAppointmentService(id);

    res.status(200).json({
      message: "Rendez-vous terminé avec succès",
      rendezVous: updatedAppointment,
    });
  } catch (error) {
    console.error("Erreur lors de la fin du rendez-vous:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Rendez-vous non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message.startsWith("Impossible de terminer")) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

/**
 * Met à jour les notes du médecin pour un rendez-vous
 * Route : PUT /api/rendez-vous/:id/notes-medecin
 */
export const updateNotesMedecin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medecinId = req.userId;
    const { notes } = req.body;
    if (!notes || typeof notes !== "string") {
      return res.status(400).json({ message: "Le champ notes est requis." });
    }
    const result = await updateNotesMedecinService(id, medecinId, notes);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("non trouvé")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("non autorisé")) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Met à jour la raison d'annulation pour un rendez-vous
 * Route : PUT /api/rendez-vous/:id/raison-annulation
 */
export const updateRaisonAnnulation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medecinId = req.userId;
    const { raison } = req.body;
    if (!raison || typeof raison !== "string") {
      return res.status(400).json({ message: "Le champ raison est requis." });
    }
    const result = await updateRaisonAnnulationService(id, medecinId, raison);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("non trouvé")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("non autorisé")) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};
