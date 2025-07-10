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
} from "../services/rendezvous.service.js";
import {
  validatePatientExists,
  validateDoctorExists,
} from "../services/validation.service.js";

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
