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
    const {
      email,
      password,
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
      patient_data,
      medecin_data,
    } = req.body;

    console.log("Tentative d'inscription pour:", email);

    // Vérifier si l'utilisateur existe déjà
    const userCheck = await pool.query(
      "SELECT * FROM utilisateur WHERE email = $1",
      [email]
    );
    if (userCheck.rows.length > 0) {
      console.log("Email déjà utilisé:", email);
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

    console.log("Création de l'utilisateur dans la table utilisateur");

    // Insérer l'utilisateur
    const newUser = await pool.query(
      "INSERT INTO utilisateur (email, password, nom, prenom, role, date_naissance, tel_indicatif, tel_numero, sexe, adresse, code_postal, ville) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [
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
      ]
    );

    const userId = newUser.rows[0].id;
    console.log("Utilisateur créé avec ID:", userId);

    // Créer automatiquement une entrée dans la table correspondante au rôle
    try {
      if (role === "patient") {
        // Si des données patient sont fournies, les utiliser
        if (patient_data) {
          const { groupe_sanguin, poids } = patient_data;
          await pool.query(
            "INSERT INTO patient (utilisateur_id, groupe_sanguin, poids) VALUES ($1, $2, $3)",
            [userId, groupe_sanguin, poids]
          );
        } else {
          // Sinon, créer une entrée vide
          await pool.query("INSERT INTO patient (utilisateur_id) VALUES ($1)", [
            userId,
          ]);
        }
        console.log("Profil patient créé");
      } else if (role === "medecin") {
        // Si des données médecin sont fournies, les utiliser
        if (medecin_data) {
          const { specialite, description } = medecin_data;
          await pool.query(
            "INSERT INTO medecin (utilisateur_id, specialite, description) VALUES ($1, $2, $3)",
            [userId, specialite, description]
          );
        } else {
          // Sinon, créer une entrée avec une spécialité par défaut
          await pool.query(
            "INSERT INTO medecin (utilisateur_id, specialite) VALUES ($1, $2)",
            [userId, "À préciser"]
          );
        }
        console.log("Profil médecin créé");
      } else if (role === "admin") {
        await pool.query(
          "INSERT INTO administrateurs (utilisateur_id) VALUES ($1)",
          [userId]
        );
        console.log("Profil administrateur créé");
      }
    } catch (error) {
      console.error("Erreur lors de la création du profil spécifique:", error);
      // Ne pas échouer l'inscription si la création du profil spécifique échoue
      // On pourrait implémenter une logique de nettoyage ou de retentative plus tard
    }

    // Générer un token JWT pour permettre la création immédiate du profil
    const token = jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
      expiresIn: `${TEMPS_EXPIRATION}s`,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        nom: newUser.rows[0].nom,
        prenom: newUser.rows[0].prenom,
        role: newUser.rows[0].role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};

// Connecter un utilisateur (login)
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    console.log("Tokens générés avec succès");

    // Stocker le refresh token en base de données
    await pool.query(
      "INSERT INTO refresh_token (token, utilisateur_id, expires_at) VALUES ($1, $2, $3)",
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
        tel_indicatif: user.tel_indicatif,
        tel_numero: user.tel_numero,
        adresse: user.adresse,
        code_postal: user.code_postal,
        ville: user.ville,
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
    const { refreshToken } = req.body;

    console.log("Tentative de rafraîchissement de token");

    if (!refreshToken) {
      console.log("Refresh token manquant");
      return res.status(401).json({ message: "Refresh token manquant" });
    }

    // Vérifier si le refresh token existe en base de données
    const tokenResult = await pool.query(
      "SELECT * FROM refresh_token WHERE token = $1 AND expires_at > NOW()",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      console.log("Refresh token invalide ou expiré");
      return res
        .status(403)
        .json({ message: "Refresh token invalide ou expiré" });
    }

    // Vérifier et décoder le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
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

    // Générer un nouveau token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${TEMPS_EXPIRATION}s` }
    );

    console.log("Nouveau token généré avec succès");

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
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Supprimer le refresh token
      await pool.query("DELETE FROM refresh_token WHERE token = $1", [
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

// Point d'entrée pour vérifier les informations de l'utilisateur authentifié
export const checkUserAuth = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    console.log("Vérification de l'authentification pour l'utilisateur:", {
      userId,
      userRole,
      headers: req.headers,
    });

    // Vérifier si l'utilisateur existe dans la table utilisateur
    try {
      const userTableQuery = "SELECT * FROM utilisateur WHERE id = $1";
      const userTableResult = await pool.query(userTableQuery, [userId]);
      console.log("Résultat requête table 'utilisateur':", {
        found: userTableResult.rows.length > 0,
        role: userTableResult.rows[0]?.role,
      });
    } catch (e) {
      console.log(
        "Erreur lors de la requête sur table 'utilisateur':",
        e.message
      );
    }

    // Vérifier si l'utilisateur existe dans la table utilisateurs
    try {
      const usersTableQuery = "SELECT * FROM utilisateurs WHERE id = $1";
      const usersTableResult = await pool.query(usersTableQuery, [userId]);
      console.log("Résultat requête table 'utilisateurs':", {
        found: usersTableResult.rows.length > 0,
        role: usersTableResult.rows[0]?.role,
      });
    } catch (e) {
      console.log(
        "Erreur lors de la requête sur table 'utilisateurs':",
        e.message
      );
    }

    // Vérifier si l'utilisateur est dans la table patient
    try {
      const patientTableQuery =
        "SELECT * FROM patient WHERE utilisateur_id = $1";
      const patientTableResult = await pool.query(patientTableQuery, [userId]);
      console.log("Résultat requête table 'patient':", {
        found: patientTableResult.rows.length > 0,
        data: patientTableResult.rows[0] || null,
      });
    } catch (e) {
      console.log("Erreur lors de la requête sur table 'patient':", e.message);
    }

    // Vérifier si l'utilisateur est dans la table patients
    try {
      const patientsTableQuery =
        "SELECT * FROM patients WHERE utilisateur_id = $1";
      const patientsTableResult = await pool.query(patientsTableQuery, [
        userId,
      ]);
      console.log("Résultat requête table 'patients':", {
        found: patientsTableResult.rows.length > 0,
        data: patientsTableResult.rows[0] || null,
      });
    } catch (e) {
      console.log("Erreur lors de la requête sur table 'patients':", e.message);
    }

    // Décodez et vérifiez le token JWT
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let tokenInfo = null;

    if (token) {
      try {
        tokenInfo = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token JWT décodé:", tokenInfo);
      } catch (e) {
        console.log("Erreur lors de la vérification du token:", e.message);
      }
    }

    res.json({
      userId,
      userRole,
      tokenInfo,
      message: "Vérification d'authentification effectuée",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la vérification de l'authentification",
    });
  }
};
