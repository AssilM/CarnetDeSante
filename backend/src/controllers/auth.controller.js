import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Récupérer la durée d'expiration du token depuis les variables d'environnement (en secondes)
const TEMPS_EXPIRATION = Number(process.env.ACCESS_TOKEN_EXPIRES || 900); // Durée d'expiration du token (secondes)
console.log(`Durée d'expiration configurée: ${TEMPS_EXPIRATION} secondes`);

// Schéma Zod de validation pour l'inscription
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  date_naissance: z.string().optional(),
  tel_indicatif: z.string().optional(),
  tel_numero: z.string().optional(),
  sexe: z.string().optional(),
  adresse: z.string().optional(),
  code_postal: z.string().optional(),
  ville: z.string().optional(),
  // Données optionnelles spécifiques
  patient_data: z
    .object({
      groupe_sanguin: z.string().optional(),
      poids: z.number().optional(),
    })
    .optional(),
  medecin_data: z
    .object({
      specialite: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

// Schéma Zod de validation pour la connexion
const signinSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// Helper: crée le profil spécifique au rôle dans la même transaction
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
 * Fonction interne qui réalise toute la logique d'inscription.
 * Le rôle est désormais imposé par la route (forcedRole) et n'est plus accepté depuis le client.
 */
const performSignup = async (req, res, forcedRole) => {
  try {
    // 1. Validation des données (le rôle n'est pas attendu dans le payload)
    const data = signupSchema.parse(req.body);

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
    } = data;

    console.log(`Tentative d'inscription (${forcedRole}) pour :`, email);

    // 2. Validation métier supplémentaire : date de naissance
    if (date_naissance) {
      const today = new Date();
      const birthDate = new Date(date_naissance);
      if (birthDate > today) {
        return res.status(400).json({
          message: "La date de naissance ne peut pas être future",
        });
      }
      const minAge = 13;
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - minAge);
      if (birthDate > minAgeDate) {
        return res.status(400).json({
          message: `Vous devez avoir au moins ${minAge} ans pour vous inscrire`,
        });
      }
    }

    // 3. Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Transaction : création utilisateur + profil spécifique
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertUserText =
        "INSERT INTO utilisateur (email, password, nom, prenom, role, date_naissance, tel_indicatif, tel_numero, sexe, adresse, code_postal, ville) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *";
      const insertUserValues = [
        email,
        hashedPassword,
        nom,
        prenom,
        forcedRole,
        date_naissance,
        tel_indicatif,
        tel_numero,
        sexe,
        adresse,
        code_postal,
        ville,
      ];

      const {
        rows: [user],
      } = await client.query(insertUserText, insertUserValues);

      await createProfileByRole(
        client,
        forcedRole,
        user.id,
        patient_data,
        medecin_data
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message:
          "Compte créé. Veuillez vérifier votre e-mail pour activer votre compte.",
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
        },
      });
    } catch (dbErr) {
      await client.query("ROLLBACK");
      console.error("Erreur transaction inscription:", dbErr);
      return res.status(500).json({ message: "Erreur lors de l'inscription" });
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Données invalides", errors: err.errors });
    }
    console.error("Erreur inattendue lors de l'inscription:", err);
    return res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};

// Route publique : inscription patient
export const signupPatient = async (req, res) =>
  performSignup(req, res, "patient");

// Route publique ou protégée (à toi de décider) : inscription médecin
export const signupMedecin = async (req, res) =>
  performSignup(req, res, "medecin");

// Ancienne route générique (compatibilité). Elle crée désormais un patient.
export const signup = signupPatient;

// === Helpers pour les tokens et cookies ===

/**
 * Génère un access token JWT
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: `${TEMPS_EXPIRATION}s` }
  );
};

/**
 * Génère un refresh token JWT
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Configure le cookie refresh token sécurisé
 */
const setRefreshTokenCookie = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
};

/**
 * Invalide tous les refresh tokens d'un utilisateur
 */
const invalidateAllRefreshTokens = async (userId) => {
  await pool.query("DELETE FROM refresh_token WHERE utilisateur_id = $1", [
    userId,
  ]);
};

/**
 * Stocke un refresh token en base avec sa date d'expiration
 */
const storeRefreshToken = async (token, userId) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await pool.query(
    "INSERT INTO refresh_token (token, utilisateur_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expiresAt]
  );
};

// Connecter un utilisateur (login)
export const signin = async (req, res) => {
  try {
    // Validation Zod des données d'entrée
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validationResult.error.errors,
      });
    }

    const { email, password } = validationResult.data;

    console.log("Tentative de connexion pour:", email);

    // Vérifier si l'utilisateur existe dans la table "utilisateur"
    const result = await pool.query(
      "SELECT * FROM utilisateur WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      console.log("Utilisateur non trouvé dans la table utilisateur");
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];
    console.log("Utilisateur trouvé:", { id: user.id, role: user.role });

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Mot de passe invalide");
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer un token JWT avec une expiration configurée
    const token = generateAccessToken(user);

    // Supprimer les anciens tokens
    await invalidateAllRefreshTokens(user.id);

    // Générer un refresh token
    const refreshToken = generateRefreshToken(user.id);

    // Définir le refresh token dans un cookie HTTP-Only sécurisé
    setRefreshTokenCookie(res, refreshToken);

    // Stocker le refresh token dans la base de données
    await storeRefreshToken(refreshToken, user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Rafraîchir un token
export const refreshToken = async (req, res) => {
  try {
    // Récupérer le refresh token uniquement depuis le cookie HTTP-Only
    const refreshToken = req.cookies?.jid;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token manquant (cookie)",
      });
    }

    // Vérifier et décoder le refresh token AVANT de vérifier en base
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (jwtError) {
      console.log("Token JWT invalide:", jwtError.message);
      return res.status(403).json({ message: "Token invalide" });
    }

    // Vérifier si le refresh token existe en base de données
    const tokenResult = await pool.query(
      "SELECT * FROM refresh_token WHERE token = $1 AND expires_at > NOW()",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      console.log(
        "⚠️ SÉCURITÉ: Token reuse détecté pour l'utilisateur:",
        decoded.id
      );

      // DÉTECTION D'ATTAQUE: Le token n'est plus en base mais est encore valide JWT
      // Cela peut indiquer qu'un token volé est réutilisé
      // → Invalider TOUS les tokens de cet utilisateur par sécurité
      await invalidateAllRefreshTokens(decoded.id);

      return res.status(403).json({
        message: "Token invalide. Déconnexion de sécurité effectuée.",
      });
    }

    console.log("Refresh token décodé:", decoded);

    // Récupérer l'utilisateur
    const userResult = await pool.query(
      "SELECT id, email, role FROM utilisateur WHERE id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      console.log("Utilisateur non trouvé pour le refresh token");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = userResult.rows[0];
    console.log("Utilisateur trouvé:", { id: user.id, role: user.role });

    // Rotation : invalider l'ancien refresh token uniquement
    await pool.query("DELETE FROM refresh_token WHERE token = $1", [
      refreshToken,
    ]);

    // Générer un nouveau refresh token + cookie
    const newRefreshToken = generateRefreshToken(user.id);

    await storeRefreshToken(newRefreshToken, user.id);

    // Renouveler le cookie
    setRefreshTokenCookie(res, newRefreshToken);

    // Générer un nouveau token JWT (access token)
    const token = generateAccessToken(user);

    console.log("Rotation de refresh token réussie");

    res.status(200).json({
      message: "Token rafraîchi avec succès",
      token,
    });
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    res
      .status(500)
      .json({ message: "Erreur lors du rafraîchissement du token" });
  }
};

// Déconnexion
export const signout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.jid;

    if (req.query.all === "true" && req.userId) {
      // Invalider tous les tokens de l'utilisateur
      await invalidateAllRefreshTokens(req.userId);
    } else if (refreshToken) {
      // Invalider uniquement le token courant
      await pool.query("DELETE FROM refresh_token WHERE token = $1", [
        refreshToken,
      ]);
    }

    // Supprimer le cookie côté client
    res.clearCookie("jid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      "SELECT id, email, nom, prenom, role, tel_indicatif, tel_numero, date_naissance, sexe, adresse, code_postal, ville FROM utilisateur WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];

    res.status(200).json({
      user: {
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
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
};
