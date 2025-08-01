import cron from "node-cron";
import pool from "../config/db.js";

/**
 * Service de nettoyage automatique des tokens expirés
 * S'exécute toutes les 15 minutes pour nettoyer la base de données
 */

/**
 * Nettoie les tokens expirés
 * @returns {Promise<number>} Nombre de tokens supprimés
 */
const cleanExpiredTokens = async () => {
  try {
    const result = await pool.query(`
      DELETE FROM user_tokens
      WHERE expires_at < NOW()
         OR (attempts_left <= 0)
         OR (created_at < NOW() - INTERVAL '24 hours')
    `);

    console.log("🧹 Cron cleanTokens ➜", result.rowCount, "tokens supprimés");
    return result.rowCount;
  } catch (error) {
    console.error(
      "❌ Erreur lors du nettoyage automatique des tokens:",
      error.message
    );
    return 0;
  }
};

/**
 * Nettoie les refresh tokens expirés
 * @returns {Promise<number>} Nombre de refresh tokens supprimés
 */
const cleanExpiredRefreshTokens = async () => {
  try {
    const result = await pool.query(`

      DELETE FROM refresh_token

      WHERE expires_at < NOW()
         OR (created_at < NOW() - INTERVAL '30 days')
    `);

    console.log(
      "🧹 Cron cleanRefreshTokens ➜",
      result.rowCount,
      "refresh tokens supprimés"
    );
    return result.rowCount;
  } catch (error) {
    console.error(
      "❌ Erreur lors du nettoyage automatique des refresh tokens:",
      error.message
    );
    return 0;
  }
};

/**

 * Fonction principale de nettoyage
 * Nettoie tous les types de données expirées
 */
const performCleanup = async () => {
  console.log("🕐 Début du nettoyage automatique...");

  const tokensDeleted = await cleanExpiredTokens();
  const refreshTokensDeleted = await cleanExpiredRefreshTokens();

  const sessionsDeleted = await cleanExpiredSessions();

  const totalDeleted = tokensDeleted + refreshTokensDeleted + sessionsDeleted;


  if (totalDeleted > 0) {
    console.log(
      `✅ Nettoyage terminé ➜ ${totalDeleted} éléments supprimés au total`
    );
  } else {
    console.log("✅ Nettoyage terminé ➜ Aucun élément à supprimer");
  }
};

/**
 * Initialise les tâches cron
 */
export const initCronJobs = () => {
  console.log("🕐 Initialisation des tâches cron...");

  // Nettoyage toutes les 15 minutes
  cron.schedule("*/15 * * * *", performCleanup, {
    scheduled: true,
    timezone: "Europe/Paris",
  });

  // Nettoyage quotidien à 2h du matin
  cron.schedule(
    "0 2 * * *",
    async () => {
      console.log("🌙 Nettoyage quotidien en cours...");
      await performCleanup();
    },
    {
      scheduled: true,
      timezone: "Europe/Paris",
    }
  );

  console.log("✅ Tâches cron initialisées:");
  console.log("   - Nettoyage automatique: toutes les 15 minutes");
  console.log("   - Nettoyage quotidien: 2h00 du matin");
};

/**
 * Arrête toutes les tâches cron
 */
export const stopCronJobs = () => {
  console.log("🛑 Arrêt des tâches cron...");
  cron.getTasks().forEach((task) => task.stop());
  console.log("✅ Tâches cron arrêtées");
};

/**
 * Fonction pour tester le nettoyage manuellement
 */
export const testCleanup = async () => {
  console.log("🧪 Test du nettoyage manuel...");
  await performCleanup();
};
