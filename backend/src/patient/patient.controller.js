import {
  getAllPatientsService,
  getProfileService,
  getProfileByUserIdService,
  createOrUpdateProfileService,
  getMedicalInfoService,
  getPatientByIdService,
  getPatientIdByUserIdService,
  createPatientService,
  updatePatientService,
  deletePatientService,
  searchPatientsService,
} from "./patient.service.js";

// ==================== CONTRÔLEURS PROFIL PATIENT ====================

// Récupérer tous les patients
export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await getAllPatientsService();
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

// Récupérer le profil du patient connecté
export const getProfile = async (req, res, next) => {
  try {
    const result = await getProfileService(req.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Récupérer le profil d'un patient spécifique par ID utilisateur
export const getProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await getProfileByUserIdService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Créer ou mettre à jour le profil d'un patient
export const createOrUpdateProfile = async (req, res, next) => {
  try {
    const result = await createOrUpdateProfileService(
      req.userId,
      req.userRole,
      req.body
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Récupérer les informations médicales du patient connecté
export const getMedicalInfo = async (req, res, next) => {
  try {
    const result = await getMedicalInfoService(req.userId, req.userRole);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Récupérer un patient par son ID
export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await getPatientByIdService(id);
    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};

// Récupérer l'ID patient par ID utilisateur
export const getPatientIdByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await getPatientIdByUserIdService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Créer un nouveau patient
export const createPatient = async (req, res, next) => {
  try {
    const patient = await createPatientService(req.body);
    res.status(201).json({
      message: "Patient créé avec succès",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un patient
export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await updatePatientService(id, req.body);
    res.status(200).json({
      message: "Patient mis à jour avec succès",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer un patient
export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deletePatientService(id);
    res.status(200).json({ message: "Patient supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};

// Rechercher des patients
export const searchPatients = async (req, res, next) => {
  try {
    const { q } = req.query;
    const patients = await searchPatientsService(q);
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};
