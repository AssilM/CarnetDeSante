import pool from "../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  hashPassword,
  comparePassword,
} from "../utils/auth.utils.js";
import {
  findByEmail,
  insertUser,
  storeRefreshToken,
  invalidateAllRefreshTokens,
  findRefreshToken,
  deleteRefreshToken,
  findByIdLite,
  isEmailTaken,
} from "./auth.repository.js";
import jwt from "jsonwebtoken";

/**
 * Service d'authentification
 * Centralise toute la logique métier liée à l'authentification
 */

/**
 * Valide les règles métier pour la date de naissance
 * @param {string} dateNaissance - Date de naissance au format string
 * @returns {Object} { isValid: boolean, message?: string }
 */
const validateBirthDate = (dateNaissance) => {
  if (!dateNaissance) return { isValid: true };

  const today = new Date();
  const birthDate = new Date(dateNaissance);

  if (birthDate > today) {
    return {
      isValid: false,
      message: "La date de naissance ne peut pas être future",
    };
  }

  const minAge = 13;
  const minAgeDate = new Date();
  minAgeDate.setFullYear(today.getFullYear() - minAge);

  if (birthDate > minAgeDate) {
    return {
      isValid: false,
      message: `Vous devez avoir au moins ${minAge} ans pour vous inscrire`,
    };
  }

  return { isValid: true };
};

/**
 * Crée le profil spécifique au rôle dans une transaction
 * @param {Object} client - Client PostgreSQL de transaction
 * @param {string} role - Rôle de l'utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} patientData - Données spécifiques patient
 * @param {Object} medecinData - Données spécifiques médecin
 */
const createProfileByRole = async (
  client,
  role,
  userId,
  patientData,
  medecinData
) => {
  if (role === "patient") {
    if (patientData) {
      const { groupe_sanguin, poids } = patientData;
      await client.query(
        "INSERT INTO patient (utilisateur_id, groupe_sanguin, poids) VALUES ($1, $2, $3)",
        [userId, groupe_sanguin, poids]
      );
    } else {
      await client.query("INSERT INTO patient (utilisateur_id) VALUES ($1)", [
        userId,
      ]);
    }
  } else if (role === "medecin") {
    if (medecinData) {
      const { specialite, description } = medecinData;
      await client.query(
        "INSERT INTO medecin (utilisateur_id, specialite, description) VALUES ($1, $2, $3)",
        [userId, specialite, description]
      );
    } else {
      await client.query(
        "INSERT INTO medecin (utilisateur_id, specialite) VALUES ($1, $2)",
        [userId, "À préciser"]
      );
    }
  } else if (role === "admin") {
    await client.query(
      "INSERT INTO administrateurs (utilisateur_id) VALUES ($1)",
      [userId]
    );
  }
};

/**
 * Crée un nouvel utilisateur avec son profil spécifique
 * @param {Object} userData - Données de l'utilisateur
 * @param {string} role - Rôle forcé de l'utilisateur
 * @returns {Promise<Object>} Utilisateur créé (sans mot de passe)
 */
export const createUser = async (userData, role) => {
  const {
    email,
    password,
    nom,
    prenom,
    date_naissance,
    tel_indicatif,
    tel_numero,
    sexe,
    adresse,
    code_postal,
    ville,
    patient_data,
    medecin_data,
  } = userData;

  // Validation métier : date de naissance
  const birthDateValidation = validateBirthDate(date_naissance);
  if (!birthDateValidation.isValid) {
    throw new Error(birthDateValidation.message);
  }

  // Vérifier si l'email est déjà utilisé
  if (await isEmailTaken(email)) {
    throw new Error("Cet email est déjà utilisé");
  }

  // Hachage du mot de passe
  const hashedPassword = await hashPassword(password);

  // Transaction : création utilisateur + profil spécifique
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertUserValues = [
      email,
      hashedPassword,
      nom,
      prenom,
      role,
      date_naissance,
      tel_indicatif,
      tel_numero,
      sexe,
      adresse,
      code_postal,
      ville,
    ];

    const user = await insertUser(client, insertUserValues);

    await createProfileByRole(
      client,
      role,
      user.id,
      patient_data,
      medecin_data
    );

    await client.query("COMMIT");

    // Retourner l'utilisateur sans le mot de passe
    return {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      chemin_photo: user.chemin_photo || "",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur transaction inscription:", error);
    throw new Error("Erreur lors de l'inscription");
  } finally {
    client.release();
  }
};

/**
 * Authentifie un utilisateur et génère les tokens
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
export const authenticateUser = async (email, password) => {
  console.log("Service: Tentative de connexion pour:", email);

  // Vérifier si l'utilisateur existe
  const user = await findByEmail(email);
  if (!user) {
    console.log("Service: Utilisateur non trouvé");
    throw new Error("Email ou mot de passe incorrect");
  }

  console.log("Service: Utilisateur trouvé:", { id: user.id, role: user.role });

  // Vérifier le mot de passe
  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    console.log("Service: Mot de passe invalide");
    throw new Error("Email ou mot de passe incorrect");
  }

  // Supprimer les anciens tokens
  await invalidateAllRefreshTokens(user.id);

  // Générer les tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  // Stocker le refresh token en base
  await storeRefreshToken(refreshToken, user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      chemin_photo: user.chemin_photo || "",
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Effectue la rotation du refresh token
 * @param {string} currentRefreshToken - Token de refresh actuel
 * @returns {Promise<Object>} { user, accessToken, newRefreshToken }
 */
export const refreshUserToken = async (currentRefreshToken) => {
  if (!currentRefreshToken) {
    throw new Error("Refresh token manquant");
  }

  // Vérifier et décoder le refresh token
  let decoded;
  try {
    decoded = jwt.verify(currentRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (jwtError) {
    console.log("Service: Token JWT invalide:", jwtError.message);
    throw new Error("Token invalide");
  }

  // Vérifier si le refresh token existe en base
  const tokenRow = await findRefreshToken(currentRefreshToken);

  if (!tokenRow) {
    console.log(
      "⚠️ SÉCURITÉ: Token reuse détecté pour l'utilisateur:",
      decoded.id
    );

    // DÉTECTION D'ATTAQUE: invalider TOUS les tokens de cet utilisateur
    await invalidateAllRefreshTokens(decoded.id);
    throw new Error("Token invalide. Déconnexion de sécurité effectuée.");
  }

  // Récupérer l'utilisateur
  const user = await findByIdLite(decoded.id);
  if (!user) {
    console.log("Service: Utilisateur non trouvé pour le refresh token");
    throw new Error("Utilisateur non trouvé");
  }

  // Rotation : invalider l'ancien refresh token
  await deleteRefreshToken(currentRefreshToken);

  // Générer nouveaux tokens
  const newRefreshToken = generateRefreshToken(user.id);
  const accessToken = generateAccessToken(user);

  // Stocker le nouveau refresh token
  await storeRefreshToken(newRefreshToken, user.id);

  console.log("Service: Rotation de refresh token réussie");

  return {
    user,
    accessToken,
    newRefreshToken,
  };
};

/**
 * Déconnecte un utilisateur
 * @param {string} refreshToken - Token de refresh à invalider
 * @param {number} userId - ID utilisateur (pour déconnexion totale)
 * @param {boolean} allDevices - Si true, déconnecte de tous les appareils
 */
export const signoutUser = async (
  refreshToken,
  userId = null,
  allDevices = false
) => {
  if (allDevices && userId) {
    // Invalider tous les tokens de l'utilisateur
    await invalidateAllRefreshTokens(userId);
    console.log(
      "Service: Déconnexion de tous les appareils pour l'utilisateur:",
      userId
    );
  } else if (refreshToken) {
    // Invalider uniquement le token courant
    await deleteRefreshToken(refreshToken);
    console.log("Service: Déconnexion du token courant");
  }
};

/**
 * Récupère les informations de l'utilisateur connecté
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Informations de l'utilisateur
 */
export const getCurrentUser = async (userId) => {
  const user = await findByIdLite(userId);

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  return {
    id: user.id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    tel_indicatif: user.tel_indicatif,
    tel_numero: user.tel_numero,
    date_naissance: user.date_naissance,
    sexe: user.sexe,
    adresse: user.adresse,
    code_postal: user.code_postal,
    ville: user.ville,
    chemin_photo: user.chemin_photo || "",
  };
};

/**
 * Valide si un email est unique
 * @param {string} email - Email à vérifier
 * @returns {Promise<boolean>} True si l'email est disponible
 */
export const isEmailAvailable = async (email) => {
  return !(await isEmailTaken(email));
};
