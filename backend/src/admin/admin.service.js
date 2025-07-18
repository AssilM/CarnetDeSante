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
} from "./admin.repository.js";
import {
  getAllUsersService,
  getUserByIdService,
  getUsersByRoleService,
  updateUserService,
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
 * Récupère un utilisateur par ID (pour l'administration)
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé ou null
 */
export const getUserByIdAdminService = async (userId) => {
  return await getUserByIdService(userId);
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
