import pool from "../config/db.js";

/**
 * Repository pour la gestion des utilisateurs
 * Centralise toutes les opérations de base de données liées aux utilisateurs
 */

/**
 * Récupère tous les utilisateurs (sans mot de passe)
 * @returns {Promise<Array>} Liste des utilisateurs
 */
export const findAllUsers = async () => {
  try {
    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur ORDER BY id"
    );
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération des utilisateurs:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
};

/**
 * Récupère un utilisateur par ID (sans mot de passe)
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur trouvé ou undefined
 */
export const findById = async (id) => {
  try {
    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur WHERE id = $1",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche par ID ${id}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

/**
 * Récupère un utilisateur par ID avec mot de passe (pour vérification)
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur trouvé avec mot de passe ou undefined
 */
export const findByIdWithPassword = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM utilisateur WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche avec mot de passe pour ID ${id}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

/**
 * Vérifie si un email est déjà utilisé par un autre utilisateur (pour mise à jour)
 * @param {string} email - Email à vérifier
 * @param {number} excludeId - ID à exclure de la vérification
 * @returns {Promise<boolean>} True si l'email est pris, false sinon
 */
export const isEmailTaken = async (email, excludeId) => {
  try {
    const result = await pool.query(
      "SELECT id FROM utilisateur WHERE email = $1 AND id != $2",
      [email, excludeId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la vérification d'email:`,
      error.message
    );
    throw new Error("Erreur lors de la vérification de l'email");
  }
};

/**
 * Met à jour un utilisateur avec requête dynamique
 * @param {number} userId - ID de l'utilisateur
 * @param {Array<string>} updateFields - Champs à mettre à jour
 * @param {Array} values - Valeurs correspondantes
 * @returns {Promise<Object|undefined>} L'utilisateur mis à jour ou undefined
 */
export const updateUser = async (userId, updateFields, values) => {
  try {
    let query = "UPDATE utilisateur SET ";
    query += updateFields.join(", ");
    query += ` WHERE id = $${
      values.length + 1
    } RETURNING id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville`;
    values.push(userId);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la mise à jour de l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la mise à jour de l'utilisateur");
  }
};

/**
 * Met à jour le mot de passe d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} hashedPassword - Mot de passe haché
 * @returns {Promise<boolean>} True si la mise à jour a réussi
 */
export const updatePassword = async (userId, hashedPassword) => {
  try {
    const result = await pool.query(
      "UPDATE utilisateur SET password = $1 WHERE id = $2 RETURNING id",
      [hashedPassword, userId]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la mise à jour du mot de passe pour l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la mise à jour du mot de passe");
  }
};

/**
 * Supprime un utilisateur
 * @param {number} userId - ID de l'utilisateur à supprimer
 * @returns {Promise<boolean>} True si la suppression a réussi
 */
export const deleteUser = async (userId) => {
  try {
    const result = await pool.query("DELETE FROM utilisateur WHERE id = $1", [
      userId,
    ]);
    console.warn(`[SECURITY] Utilisateur supprimé - ID: ${userId}`);
    return result.rowCount > 0;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la suppression de l'utilisateur ${userId}:`,
      error.message
    );
    throw new Error("Erreur lors de la suppression de l'utilisateur");
  }
};

/**
 * Récupère les utilisateurs par rôle
 * @param {string} role - Rôle des utilisateurs à récupérer
 * @returns {Promise<Array>} Liste des utilisateurs du rôle spécifié
 */
export const findByRole = async (role) => {
  try {
    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur WHERE role = $1 ORDER BY nom, prenom",
      [role]
    );
    return result.rows;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la recherche par rôle ${role}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des utilisateurs par rôle");
  }
};
