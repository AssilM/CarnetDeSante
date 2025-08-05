import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

// Middleware pour vérifier l'authentification via token JWT
export const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token d'autorisation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Token d'authentification requis" });
    }

    const token = authHeader.split(" ")[1];

    // Vérifier et décoder le token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Erreur de vérification du token:", err.message);
        return res.status(401).json({ message: "Token invalide ou expiré" });
      }
      // Vérifier que le token contient les informations nécessaires
      if (!decoded.id || !decoded.role) {
        console.error("Token incomplet:", decoded);
        return res
          .status(401)
          .json({ message: "Token invalide (informations manquantes)" });
      }

      // Stocker les informations de l'utilisateur dans la requête
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;

      // Vérifier que l'utilisateur existe toujours en base
      try {

        // Essayer d'abord avec la table "utilisateur"
        const query = "SELECT id, email, role FROM utilisateur WHERE id = $1";
        const result = await pool.query(query, [decoded.id]);

        if (result.rows.length === 0) {
          console.log(
            `Utilisateur ${decoded.id} non trouvé dans la table "utilisateur"`
          );
          return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        // Passer à la suite
        next();
      } catch (dbError) {
        console.error(
          "Erreur lors de la vérification de l'utilisateur:",
          dbError
        );
        return res.status(500).json({
          message:
            "Erreur serveur lors de la vérification de l'authentification",
        });
      }
    });
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de l'authentification" });
  }
};

// Middleware pour vérifier les autorisations par rôle
export const authorize = (roles) => {
  return (req, res, next) => {
    // Vérifier si le middleware d'authentification a bien été exécuté d'abord
    if (!req.userId || !req.userRole) {
      return res.status(500).json({
        message:
          "Erreur de configuration des middlewares: authenticate doit être appelé avant authorize",
      });
    }

    // Convertir un rôle unique en tableau pour faciliter la vérification
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Vérifier si le rôle de l'utilisateur est autorisé
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Autorisation accordée, passer à la suite
    next();
  };
};
