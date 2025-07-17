// Controller ACL : endpoints REST pour le partage documentaire
import aclService from "./acl.service.js";

// Lister les médecins suivis par le patient connecté
export const getFollowedDoctors = async (req, res, next) => {
  try {
    const userId = req.userId;
    const doctors = await aclService.getAvailableDoctorsForPatient(userId);
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

// Suivre un patient via identité (nom, prénom, téléphone)
export const followPatient = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { nom, prenom, telephone } = req.body;
    const result = await aclService.followPatientByIdentity(
      doctorId,
      nom,
      prenom,
      telephone
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Lister les patients suivis par le médecin connecté
export const getFollowedPatients = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const patients = await aclService.getFollowedPatientsForDoctor(doctorId);
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};
