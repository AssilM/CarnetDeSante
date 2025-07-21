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
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville, created_at FROM utilisateur ORDER BY id"
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
 * Met à jour un utilisateur avec ses détails spécifiques selon son rôle
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} userData - Données utilisateur à mettre à jour
 * @param {Object} detailsData - Détails spécifiques selon le rôle
 * @returns {Promise<Object|undefined>} L'utilisateur mis à jour avec détails ou undefined
 */
export const updateUserWithDetails = async (userId, userData, detailsData) => {
  try {
    // Démarrer une transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Mettre à jour l'utilisateur de base
      const userFields = [];
      const userValues = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(userData)) {
        if (value !== undefined && value !== null) {
          userFields.push(`${key} = $${paramIndex}`);
          userValues.push(value);
          paramIndex++;
        }
      }

      if (userFields.length > 0) {
        userFields.push(`id = $${paramIndex}`);
        userValues.push(userId);

        const userQuery = `UPDATE utilisateur SET ${userFields.join(
          ", "
        )} WHERE id = $${paramIndex} RETURNING *`;
        await client.query(userQuery, userValues);
      }

      // 2. Mettre à jour les détails spécifiques selon le rôle
      if (detailsData) {
        const userResult = await client.query(
          "SELECT role FROM utilisateur WHERE id = $1",
          [userId]
        );

        if (userResult.rows.length > 0) {
          const userRole = userResult.rows[0].role;

          if (userRole === "patient" && detailsData.patient_details) {
            const { groupe_sanguin, taille, poids } =
              detailsData.patient_details;
            await client.query(
              "UPDATE patient SET groupe_sanguin = $1, taille = $2, poids = $3 WHERE utilisateur_id = $4",
              [groupe_sanguin, taille, poids, userId]
            );
          } else if (userRole === "medecin" && detailsData.medecin_details) {
            const { specialite, description } = detailsData.medecin_details;
            await client.query(
              "UPDATE medecin SET specialite = $1, description = $2 WHERE utilisateur_id = $3",
              [specialite, description, userId]
            );
          } else if (userRole === "admin" && detailsData.admin_details) {
            const { niveau_acces } = detailsData.admin_details;
            await client.query(
              "UPDATE administrateur SET niveau_acces = $1 WHERE utilisateur_id = $2",
              [niveau_acces, userId]
            );
          }
        }
      }

      await client.query("COMMIT");

      // 3. Récupérer l'utilisateur mis à jour avec ses détails
      const updatedUser = await findByIdWithDetails(userId);
      return updatedUser;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la mise à jour de l'utilisateur avec détails ${userId}:`,
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

/**
 * Récupère tous les utilisateurs avec leurs informations spécifiques selon leur rôle
 * @returns {Promise<Array>} Liste des utilisateurs avec leurs données spécifiques
 */
export const findAllUsersWithDetails = async () => {
  try {
    // Récupérer tous les utilisateurs de base
    const usersResult = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville, created_at FROM utilisateur ORDER BY id"
    );

    const users = usersResult.rows;
    const usersWithDetails = [];

    for (const user of users) {
      let userWithDetails = { ...user };

      // Ajouter les informations spécifiques selon le rôle
      if (user.role === "patient") {
        const patientResult = await pool.query(
          "SELECT groupe_sanguin, taille, poids FROM patient WHERE utilisateur_id = $1",
          [user.id]
        );
        if (patientResult.rows[0]) {
          userWithDetails.patient_details = patientResult.rows[0];
        }
      } else if (user.role === "medecin") {
        const medecinResult = await pool.query(
          "SELECT specialite, description FROM medecin WHERE utilisateur_id = $1",
          [user.id]
        );
        if (medecinResult.rows[0]) {
          userWithDetails.medecin_details = medecinResult.rows[0];
        }
      } else if (user.role === "admin") {
        const adminResult = await pool.query(
          "SELECT niveau_acces FROM administrateur WHERE utilisateur_id = $1",
          [user.id]
        );
        if (adminResult.rows[0]) {
          userWithDetails.admin_details = adminResult.rows[0];
        }
      }

      usersWithDetails.push(userWithDetails);
    }

    return usersWithDetails;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération des utilisateurs avec détails:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
};

/**
 * Récupère un utilisateur par ID avec ses informations spécifiques selon son rôle
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<Object|undefined>} L'utilisateur avec ses détails ou undefined
 */
export const findByIdWithDetails = async (id) => {
  try {
    // Récupérer l'utilisateur de base
    const userResult = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville, created_at FROM utilisateur WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return undefined;
    }

    const user = userResult.rows[0];
    let userWithDetails = { ...user };

    // Ajouter les informations spécifiques selon le rôle
    if (user.role === "patient") {
      const patientResult = await pool.query(
        "SELECT groupe_sanguin, taille, poids FROM patient WHERE utilisateur_id = $1",
        [user.id]
      );
      if (patientResult.rows[0]) {
        userWithDetails.patient_details = patientResult.rows[0];
      }
    } else if (user.role === "medecin") {
      const medecinResult = await pool.query(
        "SELECT specialite, description FROM medecin WHERE utilisateur_id = $1",
        [user.id]
      );
      if (medecinResult.rows[0]) {
        userWithDetails.medecin_details = medecinResult.rows[0];
      }
    } else if (user.role === "admin") {
      const adminResult = await pool.query(
        "SELECT niveau_acces FROM administrateur WHERE utilisateur_id = $1",
        [user.id]
      );
      if (adminResult.rows[0]) {
        userWithDetails.admin_details = adminResult.rows[0];
      }
    }

    return userWithDetails;
  } catch (error) {
    console.error(
      `[REPOSITORY] Erreur lors de la récupération de l'utilisateur avec détails pour ID ${id}:`,
      error.message
    );
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};
