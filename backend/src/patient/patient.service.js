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
