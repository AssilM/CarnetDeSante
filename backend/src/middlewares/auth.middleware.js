import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Middleware pour vérifier le token JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format "Bearer TOKEN"

  if (!token) {
    return res.status(403).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// Middleware pour vérifier les rôles
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ message: "Rôle non spécifié" });
    }

    if (roles.includes(req.userRole)) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Accès refusé. Permissions insuffisantes." });
    }
  };
};

// Middleware pour vérifier si l'utilisateur est un administrateur
export const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res
      .status(403)
      .json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

// Middleware pour vérifier si l'utilisateur est un médecin
export const isDoctor = (req, res, next) => {
  if (req.userRole !== "doctor") {
    return res.status(403).json({ message: "Accès réservé aux médecins" });
  }
  next();
};

// Middleware pour vérifier si l'utilisateur est un patient
export const isPatient = (req, res, next) => {
  if (req.userRole !== "patient") {
    return res.status(403).json({ message: "Accès réservé aux patients" });
  }
  next();
};

// Middleware pour vérifier si l'utilisateur est le propriétaire de la ressource ou un admin
export const isOwnerOrAdmin = (req, res, next) => {
  const resourceId = req.params.id;

  if (req.userId == resourceId || req.userRole === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Vous n'êtes pas autorisé à accéder à cette ressource",
    });
  }
};
