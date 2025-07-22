import {
  createVaccinByPatientService,
  getVaccinsByPatientService,
  getVaccinByIdService,
  deleteVaccinService,
  updateVaccinService,
} from "./vaccin.service.js";

// Créer un nouveau vaccin (patient)
export const createVaccinByPatient = async (req, res, next) => {
  try {
    const vaccin = await createVaccinByPatientService(
      req.userId,
      req.userRole,
      req.body,
      req.file
    );
    res.status(201).json({
      success: true,
      vaccin,
      notification: {
        type: "success",
        title: "Vaccin ajouté",
        message: `Le vaccin a été ajouté avec succès`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer tous les vaccins du patient connecté
export const getVaccinsByPatient = async (req, res, next) => {
  try {
    const patientId = req.userId; // L'utilisateur connecté est le patient
    const vaccins = await getVaccinsByPatientService(patientId);
    res.status(200).json({ success: true, vaccins });
  } catch (error) {
    next(error);
  }
};

// Récupérer un vaccin par son ID
export const getVaccinById = async (req, res, next) => {
  try {
    const vaccin = await getVaccinByIdService(
      req.userId,
      req.userRole,
      req.params.id
    );
    res.status(200).json({ success: true, vaccin });
  } catch (error) {
    next(error);
  }
};

// Supprimer un vaccin
export const deleteVaccin = async (req, res, next) => {
  try {
    const deleted = await deleteVaccinService(
      req.userId,
      req.userRole,
      req.params.id
    );
    res.status(200).json({ success: true, deleted });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un vaccin
export const updateVaccin = async (req, res, next) => {
  try {
    const vaccin = await updateVaccinService(
      req.userId,
      req.userRole,
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, vaccin });
  } catch (error) {
    next(error);
  }
};
