import {
  getAllAdministrateursService,
  getAdministrateurByUserIdService,
  updateAdministrateurNiveauAccesService,
  deleteAdministrateurService,
  getDashboardStatsService,
  getAllUsersAdminService,
  getAllUsersWithDetailsAdminService,
  getUserByIdAdminService,
  getUserByIdWithDetailsAdminService,
  getUsersByRoleAdminService,
  updateUserAdminService,
  updateUserWithDetailsAdminService,
  deleteUserAdminService,
  // Services de gestion des documents côté admin
  getAllDocumentsAdminService,
  getDocumentByIdAdminService,
  deleteDocumentAdminService,
  getDocumentsByTypeAdminService,
  // Services de gestion des liens patient-médecin
  getAllPatientDoctorRelationshipsService,
  getPatientsByDoctorService,
  getDoctorsByPatientService,
  createPatientDoctorRelationshipService,
  deletePatientDoctorRelationshipService,
  // Services de gestion des permissions de documents
  getAllDocumentPermissionsService,
  getDocumentPermissionsService,
  createDocumentPermissionService,
  deleteDocumentPermissionService,
} from "./admin.service.js";

/**
 * Controller pour la gestion des administrateurs
 * Orchestre les requêtes HTTP et utilise les services
 */

/**
 * Récupérer tous les administrateurs
 */
export const getAllAdministrateurs = async (req, res, next) => {
  try {
    const administrateurs = await getAllAdministrateursService();
    res.status(200).json({ administrateurs });
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs:", error);
    next(error);
  }
};

/**
 * Récupérer un administrateur par son ID utilisateur
 */
export const getAdministrateurById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const administrateur = await getAdministrateurByUserIdService(id);

    if (!administrateur) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    res.status(200).json({ administrateur });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'administrateur:", error);
    next(error);
  }
};

/**
 * Mettre à jour le niveau d'accès d'un administrateur
 */
export const updateAdministrateur = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { niveau_acces } = req.body;

    if (!niveau_acces) {
      return res.status(400).json({ message: "Le niveau d'accès est requis" });
    }

    const updatedAdmin = await updateAdministrateurNiveauAccesService(
      id,
      niveau_acces
    );

    res.status(200).json({
      message: "Niveau d'accès mis à jour avec succès",
      administrateur: updatedAdmin,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'administrateur:", error);

    // Gestion spécifique des erreurs métier
    if (error.message.includes("Niveau d'accès invalide")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Utilisateur non trouvé")) {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

/**
 * Supprimer un profil administrateur
 */
export const deleteAdministrateur = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteAdministrateurService(id);

    res.status(200).json({
      message: "Profil administrateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'administrateur:", error);

    if (error.message.includes("Utilisateur non trouvé")) {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

/**
 * Récupérer les statistiques pour le tableau de bord administrateur
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    next(error);
  }
};

// ==================== CONTROLLERS GESTION UTILISATEURS (CÔTÉ ADMIN) ====================

/**
 * Récupérer tous les utilisateurs (pour l'administration)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersAdminService();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    next(error);
  }
};

/**
 * Récupérer tous les utilisateurs avec leurs détails spécifiques (pour l'administration)
 */
export const getAllUsersWithDetails = async (req, res, next) => {
  try {
    const users = await getAllUsersWithDetailsAdminService();
    res.status(200).json({ users });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs avec détails:",
      error
    );
    next(error);
  }
};

/**
 * Récupérer un utilisateur par ID (pour l'administration)
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdAdminService(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    next(error);
  }
};

/**
 * Récupérer un utilisateur par ID avec ses détails spécifiques (pour l'administration)
 */
export const getUserByIdWithDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdWithDetailsAdminService(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur avec détails:",
      error
    );
    next(error);
  }
};

/**
 * Récupérer les utilisateurs par rôle (pour l'administration)
 */
export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const users = await getUsersByRoleAdminService(role);

    res.status(200).json({ users });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs par rôle:",
      error
    );
    next(error);
  }
};

/**
 * Mettre à jour un utilisateur (pour l'administration)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await updateUserAdminService(id, updateData);

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Cet email est déjà utilisé") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Aucune donnée fournie pour la mise à jour") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

/**
 * Mettre à jour un utilisateur avec ses détails spécifiques (pour l'administration)
 */
export const updateUserWithDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await updateUserWithDetailsAdminService(id, updateData);

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'utilisateur avec détails:",
      error
    );

    // Gestion spécifique des erreurs métier
    if (error.message === "Cet email est déjà utilisé") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Aucune donnée fournie pour la mise à jour") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

/**
 * Supprimer un utilisateur (pour l'administration)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteUserAdminService(id);

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);

    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

// ==================== CONTROLLERS GESTION DOCUMENTS (CÔTÉ ADMIN) ====================

/**
 * Récupérer tous les documents (pour l'administration)
 */
export const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await getAllDocumentsAdminService();
    res.status(200).json({ documents });
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    next(error);
  }
};

/**
 * Récupérer un document par ID (pour l'administration)
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await getDocumentByIdAdminService(id);

    if (!document) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    res.status(200).json({ document });
  } catch (error) {
    console.error("Erreur lors de la récupération du document:", error);
    next(error);
  }
};

/**
 * Supprimer un document (pour l'administration)
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteDocumentAdminService(id);

    res.status(200).json({
      message: "Document supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);

    if (error.message === "Document non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

/**
 * Récupérer les documents par type (pour l'administration)
 */
export const getDocumentsByType = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    const documents = await getDocumentsByTypeAdminService(typeId);

    res.status(200).json({ documents });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des documents par type:",
      error
    );
    next(error);
  }
};

// ==================== CONTROLLERS GESTION LIENS PATIENT-MÉDECIN (CÔTÉ ADMIN) ====================

/**
 * Récupérer tous les liens patient-médecin (pour l'administration)
 */
export const getAllPatientDoctorRelationships = async (req, res, next) => {
  try {
    const relationships = await getAllPatientDoctorRelationshipsService();
    res.status(200).json({ relationships });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des liens patient-médecin:",
      error
    );
    next(error);
  }
};

/**
 * Récupérer les patients suivis par un médecin (pour l'administration)
 */
export const getPatientsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const patients = await getPatientsByDoctorService(doctorId);

    res.status(200).json({ patients });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des patients du médecin:",
      error
    );
    next(error);
  }
};

/**
 * Récupérer les médecins suivant un patient (pour l'administration)
 */
export const getDoctorsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctors = await getDoctorsByPatientService(patientId);

    res.status(200).json({ doctors });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des médecins du patient:",
      error
    );
    next(error);
  }
};

/**
 * Créer un lien patient-médecin (pour l'administration)
 */
export const createPatientDoctorRelationship = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        message: "Les IDs du patient et du médecin sont requis",
      });
    }

    const relationship = await createPatientDoctorRelationshipService(
      patientId,
      doctorId
    );

    res.status(201).json({
      message: "Lien patient-médecin créé avec succès",
      relationship,
    });
  } catch (error) {
    console.error("Erreur lors de la création du lien patient-médecin:", error);
    next(error);
  }
};

/**
 * Supprimer un lien patient-médecin (pour l'administration)
 */
export const deletePatientDoctorRelationship = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.params;

    const success = await deletePatientDoctorRelationshipService(
      patientId,
      doctorId
    );

    if (!success) {
      return res.status(404).json({
        message: "Lien patient-médecin non trouvé",
      });
    }

    res.status(200).json({
      message: "Lien patient-médecin supprimé avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du lien patient-médecin:",
      error
    );
    next(error);
  }
};

// ==================== CONTROLLERS GESTION PERMISSIONS DOCUMENTS (CÔTÉ ADMIN) ====================

/**
 * Récupérer toutes les permissions de documents (pour l'administration)
 */
export const getAllDocumentPermissions = async (req, res, next) => {
  try {
    const permissions = await getAllDocumentPermissionsService();
    res.status(200).json({ permissions });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des permissions de documents:",
      error
    );
    next(error);
  }
};

/**
 * Récupérer les permissions d'un document (pour l'administration)
 */
export const getDocumentPermissions = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const permissions = await getDocumentPermissionsService(documentId);

    res.status(200).json({ permissions });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des permissions du document:",
      error
    );
    next(error);
  }
};

/**
 * Créer une permission d'accès à un document (pour l'administration)
 */
export const createDocumentPermission = async (req, res, next) => {
  try {
    const { documentId, userId, role, expiresAt } = req.body;

    if (!documentId || !userId || !role) {
      return res.status(400).json({
        message:
          "L'ID du document, l'ID de l'utilisateur et le rôle sont requis",
      });
    }

    const permission = await createDocumentPermissionService(
      documentId,
      userId,
      role,
      expiresAt
    );

    res.status(201).json({
      message: "Permission d'accès créée avec succès",
      permission,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de la permission d'accès:",
      error
    );
    next(error);
  }
};

/**
 * Supprimer une permission d'accès à un document (pour l'administration)
 */
export const deleteDocumentPermission = async (req, res, next) => {
  try {
    const { documentId, userId } = req.params;

    const success = await deleteDocumentPermissionService(documentId, userId);

    if (!success) {
      return res.status(404).json({
        message: "Permission d'accès non trouvée",
      });
    }

    res.status(200).json({
      message: "Permission d'accès supprimée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la permission d'accès:",
      error
    );
    next(error);
  }
};
