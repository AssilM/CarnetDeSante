import pool from "../../config/db.js";

/**
 * Middleware pour valider les données d'inscription
 */
export const validateRegistrationData = (req, res, next) => {
  const { nom, prenom, email, password, role } = req.body;

  // Vérifier les champs obligatoires
  if (!nom || !prenom || !email || !password || !role) {
    return res.status(400).json({
      message: "Tous les champs sont obligatoires",
    });
  }

  // Valider le format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Format d'email invalide",
    });
  }

  // Valider le rôle
  const rolesValides = ["patient", "medecin", "admin"];
  if (!rolesValides.includes(role)) {
    return res.status(400).json({
      message: "Rôle invalide",
    });
  }

  next();
};

/**
 * Middleware pour vérifier si un email est déjà utilisé
 */
export const checkEmailUnique = async (req, res, next) => {
  const { email } = req.body;

  try {
    const query = "SELECT * FROM utilisateur WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
      });
    }

    next();
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification de l'email",
    });
  }
};

/**
 * Middleware pour valider les données de connexion
 */
export const validateLoginData = (req, res, next) => {
  const { email, password } = req.body;

  // Vérifier les champs obligatoires
  if (!email || !password) {
    return res.status(400).json({
      message: "Email et mot de passe requis",
    });
  }

  // Valider le format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Format d'email invalide",
    });
  }

  next();
};

/**
 * Middleware pour valider les données de réinitialisation de mot de passe
 */
export const validateResetPasswordData = (req, res, next) => {
  const { token, password } = req.body;

  // Vérifier les champs obligatoires
  if (!token || !password) {
    return res.status(400).json({
      message: "Token et nouveau mot de passe requis",
    });
  }

  // Valider la longueur du mot de passe
  if (password.length < 6) {
    return res.status(400).json({
      message: "Le mot de passe doit contenir au moins 6 caractères",
    });
  }

  next();
};
