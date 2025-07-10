import pool from "../config/db.js";
import {
  findAllPatients,
  findPatientByUserId,
  existsPatient,
  createPatient as createPatientRepo,
  updatePatient as updatePatientRepo,
  deletePatient as deletePatientRepo,
} from "./patient.repository.js";

// ==================== SERVICES PROFIL PATIENT ====================

/**
 * Récupérer tous les patients
 */
export const getAllPatientsService = async () => {
  return await findAllPatients();
};

/**
 * Récupérer le profil du patient connecté
 */
export const getProfileService = async (userId) => {
  const patient = await findPatientByUserId(userId);
  if (!patient) {
    throw new Error("Profil patient non trouvé");
  }
  return { patient };
};

/**
 * Récupérer le profil d'un patient spécifique par ID utilisateur
 */
export const getProfileByUserIdService = async (userId) => {
  const patient = await findPatientByUserId(userId);
  if (!patient) {
    throw new Error("Profil patient non trouvé");
  }
  return { patient };
};

/**
 * Créer ou mettre à jour le profil d'un patient
 */
export const createOrUpdateProfileService = async (
  requestUserId,
  requestUserRole,
  { utilisateur_id, groupe_sanguin, taille, poids }
) => {
  // Vérifier si l'utilisateur a le droit de modifier ce profil
  if (
    requestUserId !== parseInt(utilisateur_id) &&
    requestUserRole !== "admin"
  ) {
    throw new Error("Vous n'êtes pas autorisé à modifier ce profil");
  }

  const patientExists = await existsPatient(utilisateur_id);
  if (!patientExists) {
    await createPatientRepo(utilisateur_id, groupe_sanguin, taille, poids);
  } else {
    await updatePatientRepo(utilisateur_id, groupe_sanguin, taille, poids);
  }

  // Récupérer le profil mis à jour
  const patient = await findPatientByUserId(utilisateur_id);
  return { patient };
};

/**
 * Récupérer les informations médicales du patient connecté avec gestion des tables legacy
 */
export const getMedicalInfoService = async (userId, userRole) => {
  console.log(
    "getMedicalInfo: Récupération des infos médicales pour l'utilisateur",
    {
      userId,
      role: userRole,
    }
  );

  // Vérifier que l'utilisateur est bien un patient
  let userRoleFromDb = null;

  try {
    // Essayer d'abord avec la table "utilisateur"
    const userQuery = `SELECT role FROM utilisateur WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length > 0) {
      userRoleFromDb = userResult.rows[0].role;
      console.log(
        "getMedicalInfo: Rôle trouvé dans la table 'utilisateur':",
        userRoleFromDb
      );
    }
  } catch (error) {
    console.log(
      "getMedicalInfo: Erreur lors de la requête sur 'utilisateur':",
      error.message
    );
  }

  // Si pas trouvé, essayer avec la table "utilisateurs"
  if (!userRoleFromDb) {
    try {
      const usersQuery = `SELECT role FROM utilisateurs WHERE id = $1`;
      const usersResult = await pool.query(usersQuery, [userId]);

      if (usersResult.rows.length > 0) {
        userRoleFromDb = usersResult.rows[0].role;
        console.log(
          "getMedicalInfo: Rôle trouvé dans la table 'utilisateurs':",
          userRoleFromDb
        );
      }
    } catch (error) {
      console.log(
        "getMedicalInfo: Erreur lors de la requête sur 'utilisateurs':",
        error.message
      );
    }
  }

  // Si utilisateur non trouvé dans aucune des tables
  if (!userRoleFromDb) {
    console.log("getMedicalInfo: Utilisateur non trouvé dans les tables");
    throw new Error("Utilisateur non trouvé");
  }

  // Vérifier que l'utilisateur a le rôle patient
  if (userRoleFromDb !== "patient") {
    console.log(
      `getMedicalInfo: L'utilisateur a le rôle '${userRoleFromDb}' au lieu de 'patient'`
    );
    throw new Error("Accès non autorisé");
  }

  // Construire une requête qui fonctionne avec la nouvelle structure
  let patientInfo = null;

  try {
    const query = `
      SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
             u.nom, u.prenom, u.date_naissance, u.sexe
      FROM patient p
      INNER JOIN utilisateur u ON p.utilisateur_id = u.id
      WHERE p.utilisateur_id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      patientInfo = result.rows[0];
      console.log("getMedicalInfo: Infos patient trouvées");
    }
  } catch (error) {
    console.log(
      "getMedicalInfo: Erreur lors de la requête sur la table patient:",
      error.message
    );
  }

  if (!patientInfo) {
    console.log("getMedicalInfo: Profil patient non trouvé");
    throw new Error("Profil patient non trouvé");
  }

  console.log("getMedicalInfo: Infos médicales récupérées avec succès");
  return patientInfo;
};

/**
 * Récupérer un patient par ID
 */
export const getPatientByIdService = async (patientId) => {
  const patient = await findPatientByUserId(patientId);
  if (!patient) {
    throw new Error("Patient non trouvé");
  }
  return patient;
};

/**
 * Récupérer l'ID patient par ID utilisateur
 */
export const getPatientIdByUserIdService = async (userId) => {
  const patient = await findPatientByUserId(userId);
  if (!patient) {
    throw new Error("Patient non trouvé");
  }
  return { patientId: patient.utilisateur_id };
};

/**
 * Créer un nouveau patient
 */
export const createPatientService = async (patientData) => {
  const { utilisateur_id, groupe_sanguin, taille, poids } = patientData;

  // Vérifier que l'utilisateur existe
  const userCheck = await pool.query(
    "SELECT id FROM utilisateur WHERE id = $1",
    [utilisateur_id]
  );
  if (userCheck.rows.length === 0) {
    throw new Error("Utilisateur non trouvé");
  }

  // Vérifier que le patient n'existe pas déjà
  const patientExists = await existsPatient(utilisateur_id);
  if (patientExists) {
    throw new Error("Ce patient existe déjà");
  }

  await createPatientRepo(utilisateur_id, groupe_sanguin, taille, poids);
  return await findPatientByUserId(utilisateur_id);
};

/**
 * Mettre à jour un patient
 */
export const updatePatientService = async (patientId, updateData) => {
  const { groupe_sanguin, taille, poids } = updateData;

  // Vérifier que le patient existe
  const patientExists = await existsPatient(patientId);
  if (!patientExists) {
    throw new Error("Patient non trouvé");
  }

  await updatePatientRepo(patientId, groupe_sanguin, taille, poids);
  return await findPatientByUserId(patientId);
};

/**
 * Supprimer un patient
 */
export const deletePatientService = async (patientId) => {
  const deleted = await deletePatientRepo(patientId);
  if (!deleted) {
    throw new Error("Patient non trouvé ou suppression échouée");
  }
  return true;
};

/**
 * Rechercher des patients
 */
export const searchPatientsService = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim() === "") {
    throw new Error("Paramètre de recherche requis");
  }

  const query = `
    SELECT p.utilisateur_id, p.groupe_sanguin, p.taille, p.poids, 
           u.nom, u.prenom, u.email, u.date_naissance
    FROM patient p
    INNER JOIN utilisateur u ON p.utilisateur_id = u.id
    WHERE 
      u.nom ILIKE $1 OR 
      u.prenom ILIKE $1 OR 
      u.email ILIKE $1
    ORDER BY u.nom, u.prenom
  `;
  const result = await pool.query(query, [`%${searchQuery}%`]);
  return result.rows;
};

// ==================== SERVICES GESTION DES DOCUMENTS ====================

/**
 * Ajouter un document médical
 */
export const addDocumentService = async (
  requestUserId,
  requestUserRole,
  documentData,
  file
) => {
  console.log("📄 Début de l'ajout de document");
  console.log("📄 Utilisateur:", { id: requestUserId, role: requestUserRole });
  console.log("📄 Fichier reçu:", file);
  console.log("📄 Données du formulaire:", documentData);

  const {
    titre,
    type_document,
    description,
    date_creation,
    patient_id: bodyPatientId,
  } = documentData;

  // Validation des données requises
  if (!titre || !type_document || !file) {
    console.error("❌ Données manquantes:", {
      titre,
      type_document,
      file: !!file,
    });
    const error = new Error("Titre, type de document et fichier sont requis");
    error.code = "MISSING_DATA";
    error.details = {
      type: "error",
      title: "Données manquantes",
      message:
        "Veuillez remplir tous les champs obligatoires et sélectionner un fichier",
    };
    throw error;
  }

  // Déterminer le patient_id selon le rôle
  let patient_id;
  let medecin_id = null;

  if (requestUserRole === "patient") {
    // Le patient ajoute un document pour lui-même
    patient_id = requestUserId;
    console.log(
      "👤 Patient ajoute un document pour lui-même, patient_id:",
      patient_id
    );
  } else if (requestUserRole === "medecin") {
    // Le médecin ajoute un document pour un patient
    patient_id = bodyPatientId;
    medecin_id = requestUserId;

    if (!patient_id) {
      console.error("❌ patient_id manquant pour un médecin");
      const error = new Error("patient_id requis pour un médecin");
      error.code = "MISSING_PATIENT_ID";
      error.details = {
        type: "error",
        title: "Patient manquant",
        message:
          "Veuillez spécifier le patient pour lequel ajouter le document",
      };
      throw error;
    }
    console.log(
      "👨‍⚕️ Médecin ajoute un document, patient_id:",
      patient_id,
      "medecin_id:",
      medecin_id
    );
  }

  // Vérifier que le patient existe
  const patientCheck = await pool.query(
    "SELECT utilisateur_id FROM patient WHERE utilisateur_id = $1",
    [patient_id]
  );

  if (patientCheck.rows.length === 0) {
    console.error("❌ Patient non trouvé:", patient_id);
    const error = new Error("Patient non trouvé");
    error.code = "PATIENT_NOT_FOUND";
    error.details = {
      type: "error",
      title: "Patient introuvable",
      message: "Le patient spécifié n'existe pas dans la base de données",
    };
    throw error;
  }

  // Préparer les données du document
  const finalDocumentData = {
    patient_id: parseInt(patient_id),
    medecin_id: medecin_id ? parseInt(medecin_id) : null,
    titre: titre.trim(),
    type_document: type_document.trim(),
    nom_fichier: file.originalname,
    chemin_fichier: file.path,
    type_mime: file.mimetype,
    taille_fichier: file.size,
    date_creation: date_creation || new Date().toISOString().split("T")[0],
    description: description ? description.trim() : null,
  };

  console.log("💾 Données à insérer:", finalDocumentData);

  // Insérer le document dans la base de données
  const insertQuery = `
    INSERT INTO document (
      patient_id, medecin_id, titre, type_document, nom_fichier, 
      chemin_fichier, type_mime, taille_fichier, date_creation, description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    finalDocumentData.patient_id,
    finalDocumentData.medecin_id,
    finalDocumentData.titre,
    finalDocumentData.type_document,
    finalDocumentData.nom_fichier,
    finalDocumentData.chemin_fichier,
    finalDocumentData.type_mime,
    finalDocumentData.taille_fichier,
    finalDocumentData.date_creation,
    finalDocumentData.description,
  ];

  const result = await pool.query(insertQuery, values);
  const insertedDocument = result.rows[0];

  console.log("✅ Document inséré avec succès:", insertedDocument);

  return {
    document: insertedDocument,
    notification: {
      type: "success",
      title: "Document ajouté",
      message: `Le document "${titre}" a été ajouté avec succès`,
    },
  };
};

/**
 * Récupérer les documents d'un patient
 */
export const getPatientDocumentsService = async (
  requestUserId,
  requestUserRole,
  patientId
) => {
  console.log("📄 Récupération des documents pour le patient:", patientId);

  // Vérification des autorisations
  if (requestUserRole === "patient" && requestUserId !== parseInt(patientId)) {
    const error = new Error("Accès non autorisé");
    error.code = "UNAUTHORIZED_ACCESS";
    error.details = {
      type: "error",
      title: "Accès refusé",
      message: "Vous ne pouvez consulter que vos propres documents",
    };
    throw error;
  }

  // Vérifier que le patient existe
  const patientExists = await existsPatient(patientId);
  if (!patientExists) {
    const error = new Error("Patient non trouvé");
    error.code = "PATIENT_NOT_FOUND";
    error.details = {
      type: "error",
      title: "Patient introuvable",
      message: "Le patient spécifié n'existe pas",
    };
    throw error;
  }

  // Récupérer les documents
  const query = `
    SELECT d.*, u.nom as nom_medecin, u.prenom as prenom_medecin
    FROM document d
    LEFT JOIN medecin m ON d.medecin_id = m.utilisateur_id
    LEFT JOIN utilisateur u ON m.utilisateur_id = u.id
    WHERE d.patient_id = $1
    ORDER BY d.date_creation DESC, d.created_at DESC
  `;

  const result = await pool.query(query, [patientId]);
  console.log(
    `📄 ${result.rows.length} documents trouvés pour le patient ${patientId}`
  );

  return result.rows;
};

/**
 * Récupérer un document spécifique
 */
export const getDocumentService = async (
  requestUserId,
  requestUserRole,
  documentId
) => {
  console.log("📄 Récupération du document:", documentId);

  // Récupérer le document
  const query = `
    SELECT d.*, u.nom as nom_medecin, u.prenom as prenom_medecin
    FROM document d
    LEFT JOIN medecin m ON d.medecin_id = m.utilisateur_id
    LEFT JOIN utilisateur u ON m.utilisateur_id = u.id
    WHERE d.id = $1
  `;

  const result = await pool.query(query, [documentId]);

  if (result.rows.length === 0) {
    const error = new Error("Document non trouvé");
    error.code = "DOCUMENT_NOT_FOUND";
    error.details = {
      type: "error",
      title: "Document introuvable",
      message: "Le document demandé n'existe pas",
    };
    throw error;
  }

  const document = result.rows[0];

  // Vérification des autorisations
  if (requestUserRole === "patient" && requestUserId !== document.patient_id) {
    const error = new Error("Accès non autorisé");
    error.code = "UNAUTHORIZED_ACCESS";
    error.details = {
      type: "error",
      title: "Accès refusé",
      message: "Vous ne pouvez consulter que vos propres documents",
    };
    throw error;
  }

  console.log("📄 Document trouvé:", document.titre);
  return document;
};

/**
 * Supprimer un document
 */
export const deleteDocumentService = async (
  requestUserId,
  requestUserRole,
  documentId
) => {
  console.log("🗑️ Suppression du document:", documentId);

  // Récupérer les informations du document avant suppression
  const getDocQuery = "SELECT * FROM document WHERE id = $1";
  const docResult = await pool.query(getDocQuery, [documentId]);

  if (docResult.rows.length === 0) {
    const error = new Error("Document non trouvé");
    error.code = "DOCUMENT_NOT_FOUND";
    error.details = {
      type: "error",
      title: "Document introuvable",
      message: "Le document à supprimer n'existe pas",
    };
    throw error;
  }

  const document = docResult.rows[0];

  // Vérification des autorisations (seul le médecin créateur ou un admin peut supprimer)
  if (requestUserRole === "medecin" && requestUserId !== document.medecin_id) {
    const error = new Error("Accès non autorisé");
    error.code = "UNAUTHORIZED_ACCESS";
    error.details = {
      type: "error",
      title: "Accès refusé",
      message: "Seul le médecin qui a ajouté le document peut le supprimer",
    };
    throw error;
  }

  // Supprimer le document de la base de données
  const deleteQuery = "DELETE FROM document WHERE id = $1";
  await pool.query(deleteQuery, [documentId]);

  // TODO: Supprimer aussi le fichier physique
  // import fs from 'fs';
  // if (fs.existsSync(document.chemin_fichier)) {
  //   fs.unlinkSync(document.chemin_fichier);
  // }

  console.log("✅ Document supprimé:", document.titre);

  return {
    notification: {
      type: "success",
      title: "Document supprimé",
      message: `Le document "${document.titre}" a été supprimé avec succès`,
    },
  };
};

/**
 * Validation et récupération d'un document pour téléchargement/visualisation
 */
export const getDocumentForDownloadService = async (
  requestUserId,
  requestUserRole,
  documentId
) => {
  console.log("📥 Préparation du document pour téléchargement:", documentId);

  // Récupérer les informations du document
  const query = "SELECT * FROM document WHERE id = $1";
  const result = await pool.query(query, [documentId]);

  if (result.rows.length === 0) {
    const error = new Error("Document non trouvé");
    error.code = "DOCUMENT_NOT_FOUND";
    error.details = {
      type: "error",
      title: "Document introuvable",
      message: "Le document demandé n'existe pas",
    };
    throw error;
  }

  const document = result.rows[0];

  // Vérification des autorisations
  if (requestUserRole === "patient" && requestUserId !== document.patient_id) {
    const error = new Error("Accès non autorisé");
    error.code = "UNAUTHORIZED_ACCESS";
    error.details = {
      type: "error",
      title: "Accès refusé",
      message: "Vous ne pouvez télécharger que vos propres documents",
    };
    throw error;
  }

  // Vérifier que le fichier existe
  const fs = await import("fs");

  if (!fs.existsSync(document.chemin_fichier)) {
    console.error("❌ Fichier physique non trouvé:", document.chemin_fichier);
    const error = new Error("Fichier non trouvé sur le serveur");
    error.code = "FILE_NOT_FOUND";
    error.details = {
      type: "error",
      title: "Fichier manquant",
      message: "Le fichier n'existe plus sur le serveur",
    };
    throw error;
  }

  console.log("✅ Document préparé pour téléchargement:", document.nom_fichier);
  return document;
};
