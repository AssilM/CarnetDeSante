import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configuration du transporteur SMTP
export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configuration email
export const emailConfig = {
  from: process.env.EMAIL_FROM,
  subject: "Carnet de Santé Virtuel",
};

// Fonction de test de connexion
export const testEmailConnection = async () => {
  try {
    await emailTransporter.verify();
    console.log("✅ Connexion email réussie !");
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion email:", error.message);
    return false;
  }
};
