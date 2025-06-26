import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Récupérer la durée d'expiration du token depuis les variables d'environnement (en secondes)
const TEMPS_EXPIRATION = 6000; //Durée max d'une session en seconde
console.log(`Durée d'expiration configurée: ${TEMPS_EXPIRATION} secondes`);

// Créer un utilisateur (inscription)
export const signup = async (req, res) => {
  try {
    const { email, password, nom, prenom, role, date_naissance } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userCheck = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = $1",
      [email]
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Validation de la date de naissance si elle est fournie
    if (date_naissance) {
      const today = new Date();
      const birthDate = new Date(date_naissance);

      // Vérifier si la date est future
      if (birthDate > today) {
        return res.status(400).json({
          message: "La date de naissance ne peut pas être future",
        });
      }

      // Vérifier l'âge minimum (13 ans)
      const minAge = 13;
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - minAge);

      if (birthDate > minAgeDate) {
        return res.status(400).json({
          message: `Vous devez avoir au moins ${minAge} ans pour vous inscrire`,
        });
      }
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insérer l'utilisateur
    const newUser = await pool.query(
      "INSERT INTO utilisateurs (email, password, nom, prenom, role, date_naissance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [email, hashedPassword, nom, prenom, role, date_naissance]
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        nom: newUser.rows[0].nom,
        prenom: newUser.rows[0].prenom,
        role: newUser.rows[0].role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};

// Connecter un utilisateur (login)
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const result = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer un token JWT avec une expiration configurée
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${TEMPS_EXPIRATION}s` }
    );

    // Générer un refresh token (durée réduite pour les tests)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    // Stocker le refresh token en base de données
    await pool.query(
      "INSERT INTO refresh_tokens (token, utilisateur_id, expires_at) VALUES ($1, $2, $3)",
      [refreshToken, user.id, new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      refreshToken,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        tel: user.tel,
        adresse: user.adresse,
        code_postal: user.code_postal,
        ville: user.ville,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Rafraîchir un token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token manquant" });
    }

    // Vérifier si le refresh token existe en base de données
    const tokenResult = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Refresh token invalide ou expiré" });
    }

    // Vérifier et décoder le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Récupérer l'utilisateur
    const userResult = await pool.query(
      "SELECT * FROM utilisateurs WHERE id = $1",
      [decoded.id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = userResult.rows[0];

    // Générer un nouveau token avec une expiration configurée
    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${TEMPS_EXPIRATION}s` }
    );

    res.status(200).json({
      token: newToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token de rafraîchissement invalide" });
  }
};

// Déconnexion
export const signout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Supprimer le refresh token
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
        refreshToken,
      ]);
    }

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
      "SELECT id, email, nom, prenom, role, tel, date_naissance, sexe, adresse, code_postal, ville FROM utilisateurs WHERE id = $1",
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
        tel: user.tel,
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
