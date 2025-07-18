import {
  findAllUsers,
  findAllUsersWithDetails,
  findById,
  findByIdWithDetails,
  findByIdWithPassword,
  isEmailTaken,
  updateUser as updateUserRepo,
  updateUserWithDetails as updateUserWithDetailsRepo,
  updatePassword as updatePasswordRepo,
  deleteUser as deleteUserRepo,
  findByRole,
} from "./user.repository.js";
import { hashPassword, comparePassword } from "../utils/auth.utils.js";

/**
 * Service de gestion des utilisateurs
 * Centralise toute la logique métier liée aux utilisateurs
 */

/**
 * Récupère tous les utilisateurs
 * @returns {Promise<Array>} Liste des utilisateurs
 */
export const getAllUsersService = async () => {
  return await findAllUsers();
};

/**
 * Récupère tous les utilisateurs avec leurs détails spécifiques selon leur rôle
 * @returns {Promise<Array>} Liste des utilisateurs avec leurs détails
 */
export const getAllUsersWithDetailsService = async () => {
  return await findAllUsersWithDetails();
};

/**
 * Récupère un utilisateur par ID
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé ou null
 */
export const getUserByIdService = async (userId) => {
  return await findById(userId);
};

/**
 * Récupère un utilisateur par ID avec ses détails spécifiques selon son rôle
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé avec détails ou null
 */
export const getUserByIdWithDetailsService = async (userId) => {
  return await findByIdWithDetails(userId);
};

/**
 * Récupère les utilisateurs par rôle
 * @param {string} role - Rôle recherché
 * @returns {Promise<Array>} Liste des utilisateurs avec ce rôle
 */
export const getUsersByRoleService = async (role) => {
  return await findByRole(role);
};

/**
 * Met à jour un utilisateur avec validation métier
 * @param {string|number} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Utilisateur mis à jour
 * @throws {Error} Si validation échoue ou utilisateur non trouvé
 */
export const updateUserService = async (userId, updateData) => {
  const {
    nom,
    prenom,
    email,
    tel_indicatif,
    tel_numero,
    date_naissance,
    sexe,
    adresse,
    code_postal,
    ville,
  } = updateData;

  // Vérifier si l'email est déjà utilisé par un autre utilisateur
  if (email && (await isEmailTaken(email, userId))) {
    throw new Error("Cet email est déjà utilisé");
  }

  // Construire la requête de mise à jour dynamiquement
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  // Ajouter les champs à mettre à jour de façon dynamique
  if (nom) {
    updateFields.push(`nom = $${paramIndex++}`);
    values.push(nom);
  }
  if (prenom) {
    updateFields.push(`prenom = $${paramIndex++}`);
    values.push(prenom);
  }
  if (email) {
    updateFields.push(`email = $${paramIndex++}`);
    values.push(email);
  }
  if (tel_indicatif) {
    updateFields.push(`tel_indicatif = $${paramIndex++}`);
    values.push(tel_indicatif);
  }
  if (tel_numero) {
    updateFields.push(`tel_numero = $${paramIndex++}`);
    values.push(tel_numero);
  }
  if (date_naissance) {
    updateFields.push(`date_naissance = $${paramIndex++}`);
    values.push(date_naissance);
  }
  if (sexe) {
    updateFields.push(`sexe = $${paramIndex++}`);
    values.push(sexe);
  }
  if (adresse !== undefined) {
    updateFields.push(`adresse = $${paramIndex++}`);
    values.push(adresse);
  }
  if (code_postal !== undefined) {
    updateFields.push(`code_postal = $${paramIndex++}`);
    values.push(code_postal);
  }
  if (ville !== undefined) {
    updateFields.push(`ville = $${paramIndex++}`);
    values.push(ville);
  }

  // Validation métier : au moins un champ doit être fourni
  if (updateFields.length === 0) {
    throw new Error("Aucune donnée fournie pour la mise à jour");
  }

  // Effectuer la mise à jour
  const updatedUser = await updateUserRepo(userId, updateFields, values);
  if (!updatedUser) {
    throw new Error("Utilisateur non trouvé");
  }

  return updatedUser;
};

/**
 * Met à jour un utilisateur avec ses détails spécifiques selon son rôle
 * @param {string|number} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Utilisateur mis à jour avec détails
 */
export const updateUserWithDetailsService = async (userId, updateData) => {
  // Séparer les données utilisateur des détails spécifiques
  const userData = {};
  const detailsData = {};

  for (const [key, value] of Object.entries(updateData)) {
    if (
      key === "patient_details" ||
      key === "medecin_details" ||
      key === "admin_details"
    ) {
      detailsData[key] = value;
    } else {
      userData[key] = value;
    }
  }

  return await updateUserWithDetailsRepo(userId, userData, detailsData);
};

/**
 * Change le mot de passe d'un utilisateur avec validation
 * @param {string|number} userId - ID de l'utilisateur
 * @param {string} currentPassword - Mot de passe actuel
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<boolean>} Succès de l'opération
 * @throws {Error} Si validation échoue ou utilisateur non trouvé
 */
export const updatePasswordService = async (
  userId,
  currentPassword,
  newPassword
) => {
  // Récupérer l'utilisateur avec son mot de passe
  const user = await findByIdWithPassword(userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  // Vérifier le mot de passe actuel
  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new Error("Le mot de passe actuel est incorrect");
  }

  // Hacher le nouveau mot de passe
  const hashedNewPassword = await hashPassword(newPassword);

  // Mettre à jour le mot de passe
  const success = await updatePasswordRepo(userId, hashedNewPassword);
  if (!success) {
    throw new Error("Erreur lors de la mise à jour du mot de passe");
  }

  return true;
};

/**
 * Supprime un utilisateur
 * @param {string|number} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} Succès de l'opération
 * @throws {Error} Si utilisateur non trouvé
 */
export const deleteUserService = async (userId) => {
  const success = await deleteUserRepo(userId);
  if (!success) {
    throw new Error("Utilisateur non trouvé");
  }
  return true;
};
