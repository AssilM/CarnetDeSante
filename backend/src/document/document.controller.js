import {
  createDocumentByPatientService,
  createDocumentByDoctorService,
  getDocumentsService,
  getDocumentByIdService,
  deleteDocumentService,
  getDocumentsSharedByPatientToDoctorService,
  getDocumentDoctorsWithAccessService,
  shareDocumentByPatientService,
  getDocumentsByRendezVousService,
  getAllDocumentTypesService,
  createDocumentByDoctorWithRdvService,
} from "./document.service.js";

import path from "path";
import fs from "fs";
import documentRepository from "../document/document.repository.js";

export const getAllDocumentTypes = async (req, res, next) => {
  try {
    const types = await getAllDocumentTypesService();
    res.status(200).json({ success: true, types });
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const document = await createDocumentByPatientService(
      req.userId,
      req.userRole,
      req.body,
      req.file
    );
    res.status(201).json({
      success: true,
      document,
      notification: {
        type: "success",
        title: "Document ajouté",
        message: `Le document a été ajouté avec succès`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await getDocumentsService(req.userId, req.userRole);
    res.status(200).json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await getDocumentByIdService(
      req.userId,
      req.userRole,
      req.params.id
    );
    res.status(200).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const deleted = await deleteDocumentService(
      req.userId,
      req.userRole,
      req.params.id
    );
    res.status(200).json({ success: true, deleted });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    console.log("[DownloadDocument] Début du téléchargement:", {
      userId: req.userId,
      userRole: req.userRole,
      documentId: req.params.id
    });

    const document = await getDocumentByIdService(
      req.userId,
      req.userRole,
      req.params.id
    );
    
    console.log("[DownloadDocument] Document récupéré:", {
      documentId: document?.id,
      titre: document?.titre,
      chemin_fichier: document?.chemin_fichier
    });

    if (!document) {
      return res.status(404).json({ message: "Document non trouvé" });
    }
    
    const filePath = path.resolve(document.chemin_fichier);
    console.log("[DownloadDocument] Chemin du fichier:", filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log("[DownloadDocument] Fichier non trouvé sur le serveur");
      return res
        .status(404)
        .json({ message: "Fichier non trouvé sur le serveur" });
    }
    
    console.log("[DownloadDocument] Envoi du fichier:", document.nom_fichier);
    res.download(filePath, document.nom_fichier);
  } catch (error) {
    console.error("[DownloadDocument] Erreur:", error);
    next(error);
  }
};

export const shareDocument = async (req, res, next) => {
  try {
    const { documentId, doctorId } = req.body;
    const userId = req.userId;
    // Vérifier que l'utilisateur est owner du document
    const permissions = await documentRepository.getDocumentPermissions(
      documentId
    );
    const owner = permissions.find(
      (p) => p.role === "owner" && p.user_id === userId
    );
    if (!owner) {
      return res.status(403).json({
        message: "Accès refusé : vous n'êtes pas propriétaire du document.",
      });
    }
    // Accorder la permission "shared" au médecin
    const result = await documentRepository.createDocumentPermission(
      documentId,
      doctorId,
      "shared"
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const revokeDocument = async (req, res, next) => {
  try {
    const { documentId, doctorId } = req.body;
    const userId = req.userId;
    // Seul le owner peut révoquer
    const permissions = await documentRepository.getDocumentPermissions(
      documentId
    );
    const owner = permissions.find(
      (p) => p.role === "owner" && p.user_id === userId
    );
    if (!owner) {
      return res
        .status(403)
        .json({ message: "Seul le propriétaire peut révoquer un partage." });
    }
    const perm = permissions.find(
      (p) => p.user_id === doctorId && p.role === "shared"
    );
    if (!perm) {
      return res.status(404).json({
        message: "Aucune permission shared à révoquer pour cet utilisateur.",
      });
    }
    const ok = await documentRepository.deleteDocumentPermission(
      documentId,
      doctorId
    );
    res.status(200).json({ success: ok });
  } catch (error) {
    next(error);
  }
};

export const getSharedDocuments = async (req, res, next) => {
  try {
    const userId = req.userId;
     const docs = await documentRepository.getUserDocuments(userId);
    res.status(200).json(docs);
  } catch (error) {
    next(error);
  }
};

// Renommage des fonctions existantes pour le patient
export const createDocumentByPatient = async (req, res, next) => {
  try {
    const document = await createDocumentByPatientService(
      req.userId,
      req.userRole,
      req.body,
      req.file
    );
    res.status(201).json({
      success: true,
      document,
      notification: {
        type: "success",
        title: "Document ajouté",
        message: `Le document a été ajouté avec succès`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const shareDocumentByPatient = async (req, res, next) => {
  try {
    const { documentId, doctorId, duration } = req.body;
    const userId = req.userId;
    // Appel du service qui gère la logique owner + durée
    const result = await shareDocumentByPatientService(
      documentId,
      doctorId,
      userId,
      duration
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.message && error.message.includes("propriétaire")) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const revokeDocumentByPatient = async (req, res, next) => {
  try {
    const { documentId, doctorId } = req.body;
    const userId = req.userId;
    // Seul le owner peut révoquer
    const permissions = await documentRepository.getDocumentPermissions(
      documentId
    );
    const owner = permissions.find(
      (p) => p.role === "owner" && p.user_id === userId
    );
    if (!owner) {
      return res
        .status(403)
        .json({ message: "Seul le propriétaire peut révoquer un partage." });
    }
    const perm = permissions.find(
      (p) => p.user_id === doctorId && p.role === "shared"
    );
    if (!perm) {
      return res.status(404).json({
        message: "Aucune permission shared à révoquer pour cet utilisateur.",
      });
    }
    const ok = await documentRepository.deleteDocumentPermission(
      documentId,
      doctorId
    );
    res.status(200).json({ success: ok });
  } catch (error) {
    next(error);
  }
};

// Nouvelle fonction pour l'upload par le médecin
export const createDocumentByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const userRole = req.userRole;
    const documentData = req.body;
    const file = req.file;
    // Appel du service dédié
    const doc = await createDocumentByDoctorService(
      doctorId,
      userRole,
      documentData,
      file
    );
    res.status(201).json({ document: doc });
  } catch (error) {
    next(error);
  }
};

export const getDocumentsSharedByPatientToDoctor = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { patientId } = req.params;
    const docs = await getDocumentsSharedByPatientToDoctorService(
      patientId,
      doctorId
    );
    res.status(200).json({ success: true, documents: docs });
  } catch (error) {
    next(error);
  }
};

export const getDocumentDoctorsWithAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctors = await getDocumentDoctorsWithAccessService(id);
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    next(error);
  }
};

// Upload document (médecin) lié à un rendez-vous
export const createDocumentByDoctorWithRdv = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const userRole = req.userRole;
    const documentData = req.body;
    const file = req.file;
    
    // Récupérer le rendez_vous_id depuis les données
    const { rendez_vous_id, ...restDocumentData } = documentData;
    
    if (!rendez_vous_id) {
      const error = new Error("rendez_vous_id requis pour lier le document au rendez-vous");
      error.code = "MISSING_RENDEZ_VOUS_ID";
      return res.status(400).json({ 
        success: false, 
        error: "ID du rendez-vous requis" 
      });
    }
    
    // Appel du service dédié avec le rendez_vous_id
    const doc = await createDocumentByDoctorWithRdvService(
      doctorId,
      userRole,
      restDocumentData,
      file,
      rendez_vous_id
    );
    
    res.status(201).json({ 
      success: true,
      document: doc,
      message: "Document créé et lié au rendez-vous avec succès"
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer tous les documents liés à un rendez-vous
export const getDocumentsByRendezVous = async (req, res, next) => {
  try {
    const { rendezVousId } = req.params;
    console.log("[DocumentController] Récupération des documents pour le rendez-vous:", rendezVousId);
    
    const docs = await getDocumentsByRendezVousService(rendezVousId);
    console.log("[DocumentController] Documents trouvés:", docs);
    
    res.status(200).json({ success: true, documents: docs });
  } catch (error) {
    console.error("[DocumentController] Erreur lors de la récupération des documents:", error);
    next(error);
  }
};

// Nouvelle fonction pour créer des vaccinations sans fichier
export const createVaccinationByPatient = async (req, res, next) => {
  try {
    const document = await createDocumentByPatientService(
      req.userId,
      req.userRole,
      req.body,
      null // Pas de fichier pour les vaccinations
    );
    res.status(201).json({
      success: true,
      document,
      notification: {
        type: "success",
        title: "Vaccination ajoutée",
        message: `La vaccination a été ajoutée avec succès`,
      },
    });
  } catch (error) {
    next(error);
  }
};
