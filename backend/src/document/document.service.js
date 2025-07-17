import documentRepository from "./document.repository.js";
import aclRepository from "../acl/acl.repository.js";

export const createDocumentByPatientService = async (
  userId,
  userRole,
  documentData,
  file
) => {
  // 1. Validation des données
  const {
    titre,
    type_document,
    description,
    date_creation,
    patient_id: bodyPatientId,
    type_id,
  } = documentData;
  if (!titre || !type_document || !file) {
    const error = new Error("Titre, type de document et fichier sont requis");
    error.code = "MISSING_DATA";
    throw error;
  }
  // 2. Déterminer patient_id et medecin_id
  let patient_id;
  let medecin_id = null;
  let uploader_id = userId;
  if (userRole === "patient") {
    patient_id = userId;
  } else if (userRole === "medecin") {
    patient_id = bodyPatientId;
    medecin_id = userId;
    if (!patient_id) {
      const error = new Error("patient_id requis pour un médecin");
      error.code = "MISSING_PATIENT_ID";
      throw error;
    }
  } else {
    const error = new Error("Rôle non autorisé pour l'upload de document");
    error.code = "FORBIDDEN";
    throw error;
  }
  // 3. Préparer les données
  const docData = {
    patient_id: parseInt(patient_id),
    medecin_id: medecin_id ? parseInt(medecin_id) : null,
    uploader_id: parseInt(uploader_id),
    type_id: type_id ? parseInt(type_id) : null,
    titre: titre.trim(),
    nom_fichier: file.originalname,
    chemin_fichier: file.path,
    type_mime: file.mimetype,
    taille_fichier: file.size,
    date_creation: date_creation || new Date().toISOString().split("T")[0],
    description: description ? description.trim() : null,
  };
  // 4. Insérer le document
  const insertedDocument = await documentRepository.createDocument(docData);
  // 5. Créer les permissions ACL
  await documentRepository.createDocumentPermission(
    insertedDocument.id,
    userId,
    "owner"
  );
  if (userRole === "medecin") {
    await documentRepository.createDocumentPermission(
      insertedDocument.id,
      userId,
      "author"
    );
  }
  return insertedDocument;
};

export const createDocumentByDoctorService = async (
  doctorId,
  userRole,
  documentData,
  file
) => {
  // 1. Vérifier le rôle
  if (userRole !== "medecin") {
    const error = new Error("Seul un médecin peut utiliser cette fonction");
    error.code = "FORBIDDEN";
    throw error;
  }
  // 2. Vérifier que patient_id est fourni
  const { patient_id, ...rest } = documentData;
  if (!patient_id) {
    const error = new Error("patient_id requis pour un upload médecin");
    error.code = "MISSING_PATIENT_ID";
    throw error;
  }
  // 3. Vérifier que le patient existe
  const patientExists = await documentRepository.findPatientById(patient_id);
  if (!patientExists) {
    const error = new Error("Le patient spécifié n'existe pas");
    error.code = "PATIENT_NOT_FOUND";
    throw error;
  }
  // 4. Préparer les données
  const docData = {
    ...rest,
    patient_id: parseInt(patient_id),
    medecin_id: doctorId,
    uploader_id: doctorId,
    titre: documentData.titre?.trim(),
    nom_fichier: file.originalname,
    chemin_fichier: file.path,
    type_mime: file.mimetype,
    taille_fichier: file.size,
    date_creation:
      documentData.date_creation || new Date().toISOString().split("T")[0],
    description: documentData.description
      ? documentData.description.trim()
      : null,
  };
  // 5. Insérer le document
  const insertedDocument = await documentRepository.createDocument(docData);
  // 6. Créer les permissions ACL
  await documentRepository.createDocumentPermission(
    insertedDocument.id,
    parseInt(patient_id),
    "owner"
  );
  await documentRepository.createDocumentPermission(
    insertedDocument.id,
    doctorId,
    "author"
  );
  // 7. Lier au rendez-vous si besoin
  if (documentData.rendez_vous_id) {
    await documentRepository.linkDocumentToRendezVous(
      insertedDocument.id,
      parseInt(documentData.rendez_vous_id)
    );
  }
  return insertedDocument;
};

export const getDocumentsService = async (userId, userRole) => {
  // Récupérer tous les documents accessibles à l'utilisateur
  return await documentRepository.getUserDocuments(userId);
};

export const getDocumentByIdService = async (userId, userRole, documentId) => {
  // Vérifier la permission ACL
  const permissions = await documentRepository.getDocumentPermissions(
    documentId
  );
  const perm = permissions.find((p) => p.user_id === userId);
  if (!perm) {
    const error = new Error("Accès non autorisé à ce document");
    error.code = "FORBIDDEN";
    throw error;
  }
  return await documentRepository.getDocumentById(documentId);
};

export const deleteDocumentService = async (userId, userRole, documentId) => {
  // Seul owner, author ou admin peut supprimer
  const permissions = await documentRepository.getDocumentPermissions(
    documentId
  );
  const perm = permissions.find((p) => p.user_id === userId);
  if (!perm && userRole !== "admin") {
    const error = new Error("Accès non autorisé à la suppression");
    error.code = "FORBIDDEN";
    throw error;
  }
  return await documentRepository.deleteDocument(documentId);
};

export const getDocumentsSharedByPatientToDoctorService = async (
  patientId,
  doctorId
) => {
  return await documentRepository.getDocumentsSharedByPatientToDoctor(
    patientId,
    doctorId
  );
};

export const getDocumentDoctorsWithAccessService = async (documentId) => {
  return await documentRepository.getDocumentDoctorsWithAccess(documentId);
};

export const shareDocumentByPatientService = async (
  documentId,
  doctorId,
  ownerId,
  duration
) => {
  // Vérifier que l'utilisateur est owner du document
  const permissions = await documentRepository.getDocumentPermissions(
    documentId
  );
  const owner = permissions.find(
    (p) => p.role === "owner" && p.user_id === ownerId
  );
  if (!owner) {
    throw new Error("Accès refusé : vous n'êtes pas propriétaire du document.");
  }
  let expiresAt = null;
  if (duration) {
    // duration en jours
    const now = new Date();
    expiresAt = new Date(
      now.getTime() + Number(duration) * 24 * 60 * 60 * 1000
    );
  }
  // Accorder la permission "shared" au médecin
  return await documentRepository.createDocumentPermission(
    documentId,
    doctorId,
    "shared",
    expiresAt
  );
};

export const getDocumentsByRendezVousService = async (rendezVousId) => {
  return await documentRepository.getDocumentsByRendezVous(rendezVousId);
};
