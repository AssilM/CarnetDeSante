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
    rendez_vous_id, // NOUVEAU: récupérer l'ID du rendez-vous
  } = documentData;

  // Permettre l'absence de fichier uniquement pour Vaccination
  const isVaccination =
    (type_document && type_document.toLowerCase() === "vaccination") ||
    (type_id && (await documentRepository.getTypeIdByLabel("Vaccination")) === parseInt(type_id));

  if (!titre || !type_document || (!file && !isVaccination)) {
    const error = new Error("Titre, type de document et fichier sont requis (sauf pour la vaccination) ");
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

  // 3. Récupérer l'id du type de document à partir du label ou du code reçu (type_document)
  let resolvedTypeId = type_id;
  if (!resolvedTypeId && type_document) {
    // Essayer d'abord par label exact
    resolvedTypeId = await documentRepository.getTypeIdByLabel(type_document);
    if (!resolvedTypeId) {
      // Sinon, essayer par code (insensible à la casse)
      resolvedTypeId = await documentRepository.getTypeIdByCode(type_document);
    }
    if (!resolvedTypeId) {
      const error = new Error("Type de document inconnu : " + type_document);
      error.code = "INVALID_TYPE_DOCUMENT";
      throw error;
    }
  }

  // 4. Préparer les données
  let docData;
  if (file) {
    docData = {
      patient_id: parseInt(patient_id),
      medecin_id: medecin_id ? parseInt(medecin_id) : null,
      uploader_id: parseInt(uploader_id),
      type_id: resolvedTypeId ? parseInt(resolvedTypeId) : null,
      titre: titre.trim(),
      nom_fichier: file.originalname,
      chemin_fichier: file.path,
      type_mime: file.mimetype,
      taille_fichier: file.size,
      date_creation: date_creation || new Date().toISOString().split("T")[0],
      description: description ? description.trim() : null,
    };
  } else if (isVaccination) {
    docData = {
      patient_id: parseInt(patient_id),
      medecin_id: medecin_id ? parseInt(medecin_id) : null,
      uploader_id: parseInt(uploader_id),
      type_id: resolvedTypeId ? parseInt(resolvedTypeId) : null,
      titre: titre.trim(),
      nom_fichier: "Aucun document",
      chemin_fichier: null,
      type_mime: "none",
      taille_fichier: 0,
      date_creation: date_creation || new Date().toISOString().split("T")[0],
      description: description ? description.trim() : null,
    };
  } else {
    // Cas impossible normalement (déjà géré plus haut)
    throw new Error("Fichier manquant pour un type non vaccination");
  }

  // 5. Insérer le document
  const insertedDocument = await documentRepository.createDocument(docData);
  
  // 6. Créer les permissions ACL
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

  // 7. NOUVEAU: Lier au rendez-vous si spécifié
  if (rendez_vous_id) {
    console.log(`[DocumentService] Liaison du document ${insertedDocument.id} au rendez-vous ${rendez_vous_id}`);
    await documentRepository.linkDocumentToRendezVous(
      insertedDocument.id,
      parseInt(rendez_vous_id)
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
  const { patient_id, rendez_vous_id, ...rest } = documentData; // NOUVEAU: récupérer rendez_vous_id
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
  // 4. Récupérer l'id du type de document à partir du label ou du code reçu (type_document)
  let resolvedTypeId = rest.type_id;
  if (!resolvedTypeId && rest.type_document) {
    resolvedTypeId = await documentRepository.getTypeIdByLabel(rest.type_document);
    if (!resolvedTypeId) {
      resolvedTypeId = await documentRepository.getTypeIdByCode(rest.type_document);
    }
    if (!resolvedTypeId) {
      const error = new Error("Type de document inconnu : " + rest.type_document);
      error.code = "INVALID_TYPE_DOCUMENT";
      throw error;
    }
  }
  // 5. Préparer les données
  const isVaccination =
    (rest.type_document && rest.type_document.toLowerCase() === "vaccination") ||
    (resolvedTypeId && (await documentRepository.getTypeIdByLabel("Vaccination")) === parseInt(resolvedTypeId));
  let docData;
  if (file) {
    docData = {
      ...rest,
      patient_id: parseInt(patient_id),
      medecin_id: doctorId,
      uploader_id: doctorId,
      type_id: resolvedTypeId ? parseInt(resolvedTypeId) : null,
      titre: rest.titre?.trim(),
      nom_fichier: file.originalname,
      chemin_fichier: file.path,
      type_mime: file.mimetype,
      taille_fichier: file.size,
      date_creation:
        rest.date_creation || new Date().toISOString().split("T")[0],
      description: rest.description ? rest.description.trim() : null,
    };
  } else if (isVaccination) {
    docData = {
      ...rest,
      patient_id: parseInt(patient_id),
      medecin_id: doctorId,
      uploader_id: doctorId,
      type_id: resolvedTypeId ? parseInt(resolvedTypeId) : null,
      titre: rest.titre?.trim(),
      nom_fichier: "Aucun document",
      chemin_fichier: null,
      type_mime: "none",
      taille_fichier: 0,
      date_creation:
        rest.date_creation || new Date().toISOString().split("T")[0],
      description: rest.description ? rest.description.trim() : null,
    };
  } else {
    throw new Error("Fichier manquant pour un type non vaccination");
  }
  // 6. Insérer le document
  const insertedDocument = await documentRepository.createDocument(docData);
  // 7. Créer les permissions ACL
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
  // 8. NOUVEAU: Lier au rendez-vous si spécifié
  if (rendez_vous_id) {
    console.log(`[DocumentService] Liaison du document ${insertedDocument.id} au rendez-vous ${rendez_vous_id}`);
    await documentRepository.linkDocumentToRendezVous(
      insertedDocument.id,
      parseInt(rendez_vous_id)
    );
  }
  return insertedDocument;
};

export const getDocumentsService = async (userId, userRole) => {
  // Récupérer tous les documents accessibles à l'utilisateur
  const docs = await documentRepository.getUserDocuments(userId);
  // On renvoie le label du type de document sous le nom type_document (pour le front)
  return docs.map(doc => {
    if (doc.type_document_label) {
      doc.type_document = doc.type_document_label;
    }
    return doc;
  });
};

export const getDocumentByIdService = async (userId, userRole, documentId) => {
  // Vérifier la permission ACL
  const permissions = await documentRepository.getDocumentPermissions(documentId);
  const perm = permissions.find((p) => p.user_id === userId);
  if (!perm) {
    const error = new Error("Accès non autorisé à ce document");
    error.code = "FORBIDDEN";
    throw error;
  }
  const doc = await documentRepository.getDocumentById(documentId);
  // On renvoie le label du type de document sous le nom type_document (pour le front)
  if (doc && doc.type_document_label) {
    doc.type_document = doc.type_document_label;
  }
  return doc;
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

export const getAllDocumentTypesService = async () => {
  return await documentRepository.getAllDocumentTypes();
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

// Service spécifique pour créer un document lié à un rendez-vous
export const createDocumentByDoctorWithRdvService = async (
  doctorId,
  userRole,
  documentData,
  file,
  rendezVousId
) => {
  // Ajouter le rendez_vous_id aux données du document
  const documentDataWithRdv = {
    ...documentData,
    rendez_vous_id: rendezVousId
  };
  
  // Utiliser le service existant qui gère déjà la liaison
  return await createDocumentByDoctorService(
    doctorId,
    userRole,
    documentDataWithRdv,
    file
  );
};
