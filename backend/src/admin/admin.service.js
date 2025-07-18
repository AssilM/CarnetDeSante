import {
  findAllAdministrateurs,
  findAdministrateurByUserId,
  isUserAdministrateur,
  updateAdministrateurNiveauAcces,
  deleteAdministrateur,
  getDashboardStats,
  // Fonctions de gestion des documents côté admin
  findAllDocumentsAdmin,
  findDocumentByIdAdmin,
  deleteDocumentAdmin,
  findDocumentsByTypeAdmin,
  // Fonctions de gestion des liens patient-médecin
  findAllPatientDoctorRelationships,
  getPatientsByDoctor,
  getDoctorsByPatient,
  createPatientDoctorRelationship,
  deletePatientDoctorRelationship,
  // Fonctions de gestion des permissions de documents
  findAllDocumentPermissions,
  getDocumentPermissions,
  createDocumentPermission,
  deleteDocumentPermission,
} from "./admin.repository.js";
import {
  getAllUsersService,
  getAllUsersWithDetailsService,
  getUserByIdService,
  getUserByIdWithDetailsService,
  getUsersByRoleService,
  updateUserService,
  updateUserWithDetailsService,
  deleteUserService,
} from "../user/user.service.js";

/**
 * Service de gestion des administrateurs
 * Centralise toute la logique métier liée aux administrateurs
 */

/**
 * Récupère tous les administrateurs
 * @returns {Promise<Array>} Liste des administrateurs
 */
export const getAllAdministrateursService = async () => {
  return await findAllAdministrateurs();
};

/**
 * Récupère un administrateur par son ID utilisateur
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Administrateur trouvé ou null
 */
export const getAdministrateurByUserIdService = async (userId) => {
  return await findAdministrateurByUserId(userId);
};

/**
 * Vérifie si un utilisateur est administrateur
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} True si l'utilisateur est administrateur
 */
export const isUserAdministrateurService = async (userId) => {
  return await isUserAdministrateur(userId);
};

/**
 * Met à jour le niveau d'accès d'un administrateur avec validation
 * @param {string|number} userId - ID de l'utilisateur
 * @param {string} niveauAcces - Nouveau niveau d'accès
 * @returns {Promise<Object>} Administrateur mis à jour
 * @throws {Error} Si validation échoue ou administrateur non trouvé
 */
export const updateAdministrateurNiveauAccesService = async (
  userId,
  niveauAcces
) => {
  // Validation du niveau d'accès
  const niveauxAutorises = ["standard", "elevé", "super"];
  if (!niveauxAutorises.includes(niveauAcces)) {
    throw new Error(
      "Niveau d'accès invalide. Valeurs autorisées : standard, élevé, super"
    );
  }

  // Vérifier que l'utilisateur est bien administrateur
  const isAdmin = await isUserAdministrateur(userId);
  if (!isAdmin) {
    throw new Error("Utilisateur non trouvé ou non administrateur");
  }

  // Effectuer la mise à jour
  const updatedAdmin = await updateAdministrateurNiveauAcces(
    userId,
    niveauAcces
  );
  if (!updatedAdmin) {
    throw new Error("Erreur lors de la mise à jour du niveau d'accès");
  }

  return updatedAdmin;
};

/**
 * Supprime un profil administrateur avec validation
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} Succès de l'opération
 * @throws {Error} Si administrateur non trouvé
 */
export const deleteAdministrateurService = async (userId) => {
  // Vérifier que l'utilisateur est bien administrateur
  const isAdmin = await isUserAdministrateur(userId);
  if (!isAdmin) {
    throw new Error("Utilisateur non trouvé ou non administrateur");
  }

  // Effectuer la suppression
  const success = await deleteAdministrateur(userId);
  if (!success) {
    throw new Error("Erreur lors de la suppression du profil administrateur");
  }

  return true;
};

/**
 * Récupère les statistiques du tableau de bord administrateur
 * @returns {Promise<Object>} Statistiques du système
 */
export const getDashboardStatsService = async () => {
  return await getDashboardStats();
};

// ==================== SERVICES GESTION UTILISATEURS (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les utilisateurs (pour l'administration)
 * @returns {Promise<Array>} Liste des utilisateurs
 */
export const getAllUsersAdminService = async () => {
  return await getAllUsersService();
};

/**
 * Récupère tous les utilisateurs avec leurs détails spécifiques (pour l'administration)
 * @returns {Promise<Array>} Liste des utilisateurs avec leurs détails
 */
export const getAllUsersWithDetailsAdminService = async () => {
  return await getAllUsersWithDetailsService();
};

/**
 * Récupère un utilisateur par ID (pour l'administration)
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé ou null
 */
export const getUserByIdAdminService = async (userId) => {
  return await getUserByIdService(userId);
};

/**
 * Récupère un utilisateur par ID avec ses détails spécifiques (pour l'administration)
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé avec détails ou null
 */
export const getUserByIdWithDetailsAdminService = async (userId) => {
  return await getUserByIdWithDetailsService(userId);
};

/**
 * Récupère les utilisateurs par rôle (pour l'administration)
 * @param {string} role - Rôle recherché
 * @returns {Promise<Array>} Liste des utilisateurs avec ce rôle
 */
export const getUsersByRoleAdminService = async (role) => {
  return await getUsersByRoleService(role);
};

/**
 * Met à jour un utilisateur (pour l'administration)
 * @param {string|number} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Utilisateur mis à jour
 */
export const updateUserAdminService = async (userId, updateData) => {
  return await updateUserService(userId, updateData);
};

/**
 * Met à jour un utilisateur avec ses détails spécifiques (pour l'administration)
 * @param {string|number} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Utilisateur mis à jour avec détails
 */
export const updateUserWithDetailsAdminService = async (userId, updateData) => {
  return await updateUserWithDetailsService(userId, updateData);
};

/**
 * Supprime un utilisateur (pour l'administration)
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} Succès de l'opération
 */
export const deleteUserAdminService = async (userId) => {
  return await deleteUserService(userId);
};

// ==================== SERVICES GESTION DOCUMENTS (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les documents avec informations détaillées (pour l'administration)
 * @returns {Promise<Array>} Liste des documents avec informations utilisateurs
 */
export const getAllDocumentsAdminService = async () => {
  return await findAllDocumentsAdmin();
};

/**
 * Récupère un document par ID avec informations détaillées (pour l'administration)
 * @param {string|number} documentId - ID du document
 * @returns {Promise<Object|null>} Document avec informations utilisateurs ou null
 */
export const getDocumentByIdAdminService = async (documentId) => {
  return await findDocumentByIdAdmin(documentId);
};

/**
 * Supprime un document (pour l'administration)
 * @param {string|number} documentId - ID du document
 * @returns {Promise<boolean>} Succès de l'opération
 * @throws {Error} Si document non trouvé
 */
export const deleteDocumentAdminService = async (documentId) => {
  const success = await deleteDocumentAdmin(documentId);
  if (!success) {
    throw new Error("Document non trouvé");
  }
  return true;
};

/**
 * Récupère les documents par type (pour l'administration)
 * @param {string|number} typeId - ID du type de document
 * @returns {Promise<Array>} Liste des documents du type spécifié
 */
export const getDocumentsByTypeAdminService = async (typeId) => {
  return await findDocumentsByTypeAdmin(typeId);
};

// ==================== SERVICES GESTION LIENS PATIENT-MÉDECIN (CÔTÉ ADMIN) ====================

/**
 * Récupère tous les liens patient-médecin (pour l'administration)
 * @returns {Promise<Array>} Liste des liens avec informations détaillées
 */
export const getAllPatientDoctorRelationshipsService = async () => {
  return await findAllPatientDoctorRelationships();
};

/**
 * Récupère les patients suivis par un médecin (pour l'administration)
 * @param {string|number} doctorId - ID du médecin
 * @returns {Promise<Array>} Liste des patients suivis
 */
export const getPatientsByDoctorService = async (doctorId) => {
  return await getPatientsByDoctor(doctorId);
};

/**
 * Récupère les médecins suivant un patient (pour l'administration)
 * @param {string|number} patientId - ID du patient
 * @returns {Promise<Array>} Liste des médecins suivant le patient
 */
export const getDoctorsByPatientService = async (patientId) => {
  return await getDoctorsByPatient(patientId);
};

/**
 * Crée un lien patient-médecin (pour l'administration)
 * @param {string|number} patientId - ID du patient
 * @param {string|number} doctorId - ID du médecin
 * @returns {Promise<Object>} Lien créé
 */
export const createPatientDoctorRelationshipService = async (
  patientId,
  doctorId
) => {
  return await createPatientDoctorRelationship(patientId, doctorId);
};

/**
 * Supprime un lien patient-médecin (pour l'administration)
 * @param {string|number} patientId - ID du patient
 * @param {string|number} doctorId - ID du médecin
 * @returns {Promise<boolean>} Succès de l'opération
 */
export const deletePatientDoctorRelationshipService = async (
  patientId,
  doctorId
) => {
  return await deletePatientDoctorRelationship(patientId, doctorId);
};

// ==================== SERVICES GESTION PERMISSIONS DOCUMENTS (CÔTÉ ADMIN) ====================

/**
 * Récupère toutes les permissions de documents (pour l'administration)
 * @returns {Promise<Array>} Liste des permissions avec informations détaillées
 */
export const getAllDocumentPermissionsService = async () => {
  return await findAllDocumentPermissions();
};

/**
 * Récupère les permissions d'un document (pour l'administration)
 * @param {string|number} documentId - ID du document
 * @returns {Promise<Array>} Liste des permissions du document
 */
export const getDocumentPermissionsService = async (documentId) => {
  return await getDocumentPermissions(documentId);
};

/**
 * Crée une permission d'accès à un document (pour l'administration)
 * @param {string|number} documentId - ID du document
 * @param {string|number} userId - ID de l'utilisateur
 * @param {string} role - Rôle de permission (owner, author, shared)
 * @param {Date} expiresAt - Date d'expiration (optionnel)
 * @returns {Promise<Object>} Permission créée
 */
export const createDocumentPermissionService = async (
  documentId,
  userId,
  role,
  expiresAt = null
) => {
  return await createDocumentPermission(documentId, userId, role, expiresAt);
};

/**
 * Supprime une permission d'accès à un document (pour l'administration)
 * @param {string|number} documentId - ID du document
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} Succès de l'opération
 */
export const deleteDocumentPermissionService = async (documentId, userId) => {
  return await deleteDocumentPermission(documentId, userId);
};
