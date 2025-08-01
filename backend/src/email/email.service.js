import { emailTransporter, emailConfig } from "./email.config.js";
import { renderTemplate } from "./email.templates.js";
import { generateOTP, createToken } from "./token.service.js";
import pool from "../config/db.js";

/**
 * Service d'envoi d'emails
 * Gère tous les envois d'emails de l'application
 */

/**
 * Envoie un email simple de test
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} html - Contenu HTML de l'email
 * @returns {Promise<Object>} Informations sur l'envoi
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await emailTransporter.sendMail({
      ...emailConfig,
      to,
      subject,
      html,
    });

    console.log("✅ Email envoyé avec succès:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: "Email envoyé avec succès",
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi d'email:", error.message);
    throw new Error(`Erreur lors de l'envoi d'email: ${error.message}`);
  }
};

/**
 * Envoie un email de test simple
 * @param {string} to - Adresse email du destinataire
 * @returns {Promise<Object>} Informations sur l'envoi
 */
export const sendTestEmail = async (to) => {
  const html = `
    <h1>Test Email - Carnet de Santé</h1>
    <p>Si vous recevez cet email, la configuration fonctionne !</p>
    <p>Date: ${new Date().toLocaleString()}</p>
    <hr>
    <p><small>Cet email a été envoyé automatiquement par le système de test.</small></p>
  `;

  return await sendEmail(to, "Test Email - Carnet de Santé", html);
};

/**
 * Envoie un email avec un template Handlebars
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} templateName - Nom du template
 * @param {Object} templateData - Données pour le template
 * @returns {Promise<Object>} Informations sur l'envoi
 */
export const sendTemplateEmail = async (
  to,
  subject,
  templateName,
  templateData
) => {
  try {
    // Rendre le template avec les données
    const html = await renderTemplate(templateName, templateData);

    // Envoyer l'email
    const info = await emailTransporter.sendMail({
      ...emailConfig,
      to,
      subject,
      html,
    });

    console.log("✅ Email avec template envoyé avec succès:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: "Email avec template envoyé avec succès",
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi d'email avec template:",
      error.message
    );
    throw new Error(
      `Erreur lors de l'envoi d'email avec template: ${error.message}`
    );
  }
};

/**
 * Formate les données de rendez-vous pour les templates
 * @param {Object} appointment - Données du rendez-vous depuis la BDD
 * @returns {Object} Données formatées pour les templates
 */
export const formatAppointmentData = (appointment) => {
  // Formater la date
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Formater l'heure
  const timeString = appointment.heure;
  const formattedTime = timeString.substring(0, 5); // Enlever les secondes

  // Construire le nom complet du médecin
  const medecinName = `${appointment.medecin_prenom} ${appointment.medecin_nom}`;

  // Construire le nom complet du patient
  const patientName = `${appointment.patient_prenom} ${appointment.patient_nom}`;

  return {
    patientName,
    medecinName,
    specialite: appointment.specialite || "Médecine générale",
    appointmentDate: formattedDate,
    appointmentTime: formattedTime,
    duration: appointment.duree || 30,
    motif: appointment.motif || "",
    adresse: appointment.adresse || "",
    appointmentUrl: `${process.env.FRONTEND_URL}/appointments/${appointment.id}`,
    cancelUrl: `${process.env.FRONTEND_URL}/appointments/${appointment.id}/cancel`,
  };
};

/**
 * Envoie un email de confirmation de rendez-vous
 * @param {Object} appointment - Données du rendez-vous
 * @param {string} patientEmail - Email du patient
 * @returns {Promise<Object>} Informations sur l'envoi
 */
export const sendAppointmentConfirmation = async (
  appointment,
  patientEmail
) => {
  const templateData = formatAppointmentData(appointment);

  return await sendTemplateEmail(
    patientEmail,
    "Confirmation de Rendez-vous - Carnet de Santé",
    "appointment-confirmation",
    templateData
  );
};

/**
 * Envoie un email de rappel de rendez-vous
 * @param {Object} appointment - Données du rendez-vous
 * @param {string} patientEmail - Email du patient
 * @returns {Promise<Object>} Informations sur l'envoi
 */
export const sendAppointmentReminder = async (appointment, patientEmail) => {
  const templateData = formatAppointmentData(appointment);

  return await sendTemplateEmail(
    patientEmail,
    "Rappel de Rendez-vous - Carnet de Santé",
    "appointment-reminder",
    templateData
  );
};

/**
 * Envoie un email de bienvenue
 * @param {Object} user - Données de l'utilisateur
 * @returns {Promise<Object>} Informations sur l'envoi
 */
export const sendWelcomeEmail = async (user) => {
  const templateData = {
    userName: `${user.prenom} ${user.nom}`,
    userRole:
      user.role === "medecin"
        ? "Médecin"
        : user.role === "patient"
        ? "Patient"
        : user.role === "admin"
        ? "Administrateur"
        : "Utilisateur",
  };

  return await sendTemplateEmail(
    user.email,
    "Bienvenue sur Carnet de Santé Virtuel",
    "welcome",
    templateData
  );
};

/**
 * Récupère l'email d'un utilisateur par son ID
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<string|null>} Email de l'utilisateur ou null
 */
export const getUserEmailById = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT email FROM utilisateur WHERE id = $1",
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0].email : null;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de l'email:",
      error.message
    );
    return null;
  }
};

/**
 * Envoie un email de vérification avec OTP pour l'inscription
 * @param {Object} user - Données de l'utilisateur
 * @returns {Promise<Object>} Informations sur l'envoi et l'OTP créé
 */
export const sendVerificationEmail = async (user) => {
  try {
    // Générer un OTP
    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    // Créer le token en BDD
    const tokenResult = await createToken(
      user.id,
      "EMAIL_VERIFY",
      otp,
      expiryMinutes
    );

    // Préparer les données du template
    const templateData = {
      userName: `${user.prenom} ${user.nom}`,
      otp: otp,
      expiryMinutes: expiryMinutes,
    };

    // Envoyer l'email
    const emailResult = await sendTemplateEmail(
      user.email,
      "Vérification de votre compte - Carnet de Santé",
      "register",
      templateData
    );

    console.log(
      `✅ Email de vérification envoyé à ${user.email} avec OTP: ${otp}`
    );

    return {
      success: true,
      emailResult,
      tokenResult,
      message: "Email de vérification envoyé avec succès",
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de vérification:",
      error.message
    );
    throw new Error(
      `Erreur lors de l'envoi de l'email de vérification: ${error.message}`
    );
  }
};

/**
 * Envoie un email avec OTP pour la connexion
 * @param {Object} user - Données de l'utilisateur
 * @returns {Promise<Object>} Informations sur l'envoi et l'OTP créé
 */
export const sendOTPEmail = async (user) => {
  try {
    // Générer un OTP
    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    // Créer le token en BDD
    const tokenResult = await createToken(
      user.id,
      "OTP_LOGIN",
      otp,
      expiryMinutes
    );

    // Préparer les données du template
    const templateData = {
      userName: `${user.prenom} ${user.nom}`,
      otp: otp,
      expiryMinutes: expiryMinutes,
    };

    // Envoyer l'email
    const emailResult = await sendTemplateEmail(
      user.email,
      "Code de connexion - Carnet de Santé",
      "register", // On utilise le même template pour l'instant
      templateData
    );

    console.log(`✅ Email OTP envoyé à ${user.email} avec OTP: ${otp}`);

    return {
      success: true,
      emailResult,
      tokenResult,
      message: "Email OTP envoyé avec succès",
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email OTP:", error.message);
    throw new Error(`Erreur lors de l'envoi de l'email OTP: ${error.message}`);
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @param {string} resetToken - Token de réinitialisation
 * @returns {Promise<Object>} Informations sur l'envoi
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Construire l'URL de réinitialisation
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth/reset-password?token=${resetToken}`;

    // Préparer les données du template
    const templateData = {
      resetUrl: resetUrl,
      token: resetToken,
      appName: "Carnet de Santé Virtuel",
      supportEmail: "support@carnetdesante.fr",
      expiryHours: 1, // Le token expire dans 1 heure
    };

    // Envoyer l'email avec le template
    const result = await sendTemplateEmail(
      email,
      "Réinitialisation de mot de passe - Carnet de Santé",
      "password-reset",
      templateData
    );

    console.log("✅ Email de réinitialisation envoyé à:", email);
    return result;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de réinitialisation:",
      error
    );
    throw error;
  }
};
