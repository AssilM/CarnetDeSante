import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Durée d'expiration en secondes lue depuis l'env
const ACCESS_EXPIRES = Number(process.env.ACCESS_TOKEN_EXPIRES) || 900;

/**
 * Génère un access-token JWT
 * @param {{id:number,email:string,role:string}} user
 */
export const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: `${ACCESS_EXPIRES}s` }
  );

/**
 * Génère un refresh-token JWT
 * @param {number} userId
 */
export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

/**
 * Pose le cookie sécurisé contenant le refresh token
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
};

// Helpers bcrypt
export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);
