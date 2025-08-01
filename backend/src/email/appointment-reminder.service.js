import pool from "../config/db.js";
import { sendAppointmentReminder } from "./email.service.js";

/**
 * Service de gestion des rappels de rendez-vous
 */

/**
 * Envoie les rappels pour les rendez-vous 24h avant
 * Un seul rappel par RDV pour éviter les doublons
 */
export const sendHourlyReminders = async () => {
  try {
    // Calculer l'heure actuelle et l'heure dans 24h
    const now = new Date();
    const twentyFourHoursFromNow = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    // Formater les dates pour la requête SQL
    const nowStr = now.toISOString().slice(0, 19).replace("T", " ");
    const twentyFourHoursFromNowStr = twentyFourHoursFromNow
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    console.log(
      `📧 Recherche des RDV entre ${nowStr} et ${twentyFourHoursFromNowStr}`
    );

    // Récupérer les RDV qui commencent dans les 24h qui suivent
    // ET qui n'ont pas encore reçu de rappel (pas de colonne reminder_sent)
    const result = await pool.query(
      `
      SELECT rv.*, 
             u.email as patient_email,
             u.prenom as patient_prenom,
             u.nom as patient_nom,
             m_user.prenom as medecin_prenom,
             m_user.nom as medecin_nom,
             m.specialite,
             CONCAT(rv.date, ' ', rv.heure) as appointment_datetime
      FROM rendez_vous rv
      JOIN patient p ON rv.patient_id = p.utilisateur_id
      JOIN medecin m ON rv.medecin_id = m.utilisateur_id
      JOIN utilisateur u ON p.utilisateur_id = u.id
      JOIN utilisateur m_user ON m.utilisateur_id = m_user.id
      WHERE CONCAT(rv.date, ' ', rv.heure) BETWEEN $1 AND $2
        AND rv.statut IN ('confirmé', 'planifié')
        AND u.email IS NOT NULL
        AND rv.date >= CURRENT_DATE
        AND (rv.reminder_sent IS NULL OR rv.reminder_sent = false)
    `,
      [nowStr, twentyFourHoursFromNowStr]
    );

    console.log(`📧 ${result.rows.length} RDV trouvés pour rappel`);

    let emailsSent = 0;
    for (const appointment of result.rows) {
      try {
        // Calculer le temps restant
        const appointmentTime = new Date(appointment.appointment_datetime);
        const timeDiff = appointmentTime - now;
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));

        console.log(
          `📧 Envoi rappel pour RDV ${appointment.id} (${hoursLeft}h restantes)`
        );

        await sendAppointmentReminder(appointment, appointment.patient_email);

        // Marquer le RDV comme ayant reçu un rappel
        await pool.query(
          `UPDATE rendez_vous SET reminder_sent = true WHERE id = $1`,
          [appointment.id]
        );

        emailsSent++;

        console.log(
          `✅ Rappel envoyé pour RDV ${appointment.id} à ${appointment.patient_email}`
        );
      } catch (error) {
        console.error(
          `❌ Erreur envoi rappel RDV ${appointment.id}:`,
          error.message
        );
      }
    }

    console.log(
      `📧 Rappels 24h ➜ ${emailsSent}/${result.rows.length} emails envoyés`
    );
    return { sent: emailsSent, total: result.rows.length };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi des rappels 24h:", error.message);
    return { sent: 0, total: 0 };
  }
};

/**
 * Fonction supprimée - remplacée par sendHourlyReminders avec logique 24h
 * Un seul rappel par RDV est maintenant suffisant
 */
export const sendDailyReminders = async () => {
  console.log("ℹ️ Fonction sendDailyReminders désactivée - logique unifiée");
  return { sent: 0, total: 0 };
};
