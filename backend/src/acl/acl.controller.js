// Controller ACL : endpoints REST pour le partage documentaire
import aclService from "./acl.service.js";

// Partager un document avec un médecin
export const shareDocument = async (req, res, next) => {
  try {
    const { documentId, doctorId } = req.body;
    const userId = req.userId;
    // Vérifier que l'utilisateur est owner du document
    const hasPerm = await aclService.checkDocumentPermission(
      userId,
      documentId,
      "owner"
    );
    if (!hasPerm)
      return res.status(403).json({
        message: "Accès refusé : vous n'êtes pas propriétaire du document.",
      });
    const result = await aclService.grantDocumentPermission(
      documentId,
      doctorId,
      "shared"
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Révoquer le partage d'un document
export const revokeDocument = async (req, res, next) => {
  try {
    const { documentId, doctorId } = req.body;
    const userId = req.userId;
    const ok = await aclService.revokeDocumentPermission(
      documentId,
      doctorId,
      userId
    );
    res.status(200).json({ success: ok });
  } catch (error) {
    next(error);
  }
};

// Lister les documents partagés pour l'utilisateur connecté
export const getSharedDocuments = async (req, res, next) => {
  try {
    const userId = req.userId;
    const docs = await aclService.getSharedDocumentsForUser(userId);
    res.status(200).json(docs);
  } catch (error) {
    next(error);
  }
};

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
