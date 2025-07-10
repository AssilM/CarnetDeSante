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
  addDocumentService,
  getPatientDocumentsService,
  getDocumentService,
  deleteDocumentService,
  getDocumentForDownloadService,
} from "../services/patient.service.js";

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

// ==================== CONTRÔLEURS GESTION DES DOCUMENTS ====================

// Ajouter un document médical
export const addDocument = async (req, res, next) => {
  try {
    const result = await addDocumentService(
      req.userId,
      req.userRole,
      req.body,
      req.file
    );

    res.status(201).json({
      success: true,
      message: "Document ajouté avec succès",
      document: result.document,
      notification: result.notification,
    });
  } catch (error) {
    if (error.code) {
      return res.status(400).json({
        success: false,
        message: error.message,
        notification: error.details,
      });
    }
    next(error);
  }
};

// Récupérer les documents d'un patient
export const getPatientDocuments = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const documents = await getPatientDocumentsService(
      req.userId,
      req.userRole,
      patient_id
    );

    res.status(200).json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    if (error.code) {
      return res.status(error.code === "UNAUTHORIZED_ACCESS" ? 403 : 404).json({
        success: false,
        message: error.message,
        notification: error.details,
      });
    }
    next(error);
  }
};

// Récupérer un document spécifique
export const getDocument = async (req, res, next) => {
  try {
    const { document_id } = req.params;
    const document = await getDocumentService(
      req.userId,
      req.userRole,
      document_id
    );

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    if (error.code) {
      return res.status(error.code === "UNAUTHORIZED_ACCESS" ? 403 : 404).json({
        success: false,
        message: error.message,
        notification: error.details,
      });
    }
    next(error);
  }
};

// Supprimer un document
export const deleteDocument = async (req, res, next) => {
  try {
    const { document_id } = req.params;
    const result = await deleteDocumentService(
      req.userId,
      req.userRole,
      document_id
    );

    res.status(200).json({
      success: true,
      message: "Document supprimé avec succès",
      notification: result.notification,
    });
  } catch (error) {
    if (error.code) {
      return res.status(error.code === "UNAUTHORIZED_ACCESS" ? 403 : 404).json({
        success: false,
        message: error.message,
        notification: error.details,
      });
    }
    next(error);
  }
};

// Télécharger/servir un fichier de document
export const downloadDocument = async (req, res, next) => {
  try {
    const { document_id } = req.params;
    const document = await getDocumentForDownloadService(
      req.userId,
      req.userRole,
      document_id
    );

    // Import dynamique du module path
    const path = await import("path");

    // Définir les en-têtes pour le téléchargement
    res.setHeader("Content-Type", document.type_mime);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.nom_fichier}"`
    );
    res.setHeader("Content-Length", document.taille_fichier);

    console.log("✅ Envoi du fichier:", document.nom_fichier);

    // Envoyer le fichier
    res.sendFile(path.resolve(document.chemin_fichier));
  } catch (error) {
    if (error.code) {
      return res.status(error.code === "UNAUTHORIZED_ACCESS" ? 403 : 404).json({
        success: false,
        message: error.message,
        notification: error.details,
      });
    }
    next(error);
  }
};

// Visualiser/servir un fichier de document dans le navigateur
export const viewDocument = async (req, res, next) => {
  try {
    const { document_id } = req.params;
    const document = await getDocumentForDownloadService(
      req.userId,
      req.userRole,
      document_id
    );

    // Import dynamique du module path
    const path = await import("path");

    // Définir les en-têtes pour la visualisation
    res.setHeader("Content-Type", document.type_mime);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.nom_fichier}"`
    );
    res.setHeader("Content-Length", document.taille_fichier);

    console.log(
      "✅ Envoi du fichier pour visualisation:",
      document.nom_fichier
    );

    // Envoyer le fichier
    res.sendFile(path.resolve(document.chemin_fichier));
  } catch (error) {
    if (error.code) {
      return res.status(error.code === "UNAUTHORIZED_ACCESS" ? 403 : 404).json({
        success: false,
        message: error.message,
        notification: error.details,
      });
    }
    next(error);
  }
};
