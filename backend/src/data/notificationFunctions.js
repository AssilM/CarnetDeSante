import pool from "../config/db.js";

/**
 * Création de la fonction PostgreSQL pour déclencher les notifications
 * Cette fonction est appelée automatiquement par le trigger AFTER INSERT
 */
export const createNotificationTriggerFunction = async () => {
  const queryText = `
    CREATE OR REPLACE FUNCTION notify_on_notification_insert()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Envoyer une notification PostgreSQL avec l'ID de l'utilisateur
      PERFORM pg_notify('new_notification', NEW.user_id::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    await pool.query(queryText);
    console.log(
      "✅ Fonction trigger notify_on_notification_insert créée avec succès"
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création de la fonction trigger:",
      error
    );
    throw error;
  }
};

/**
 * Création du trigger AFTER INSERT sur la table notification
 */
export const createNotificationTrigger = async () => {
  const queryText = `
    DROP TRIGGER IF EXISTS trigger_notify_on_notification_insert ON notifications;
    CREATE TRIGGER trigger_notify_on_notification_insert
      AFTER INSERT ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION notify_on_notification_insert();
  `;

  try {
    await pool.query(queryText);
    console.log("✅ Trigger notification créé avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création du trigger notification:",
      error
    );
    throw error;
  }
};

/**
 * Fonction pour nettoyer les anciennes notifications (maintenance)
 * Supprime les notifications lues de plus de 30 jours
 */
export const createCleanupOldNotificationsFunction = async () => {
  const queryText = `
    CREATE OR REPLACE FUNCTION cleanup_old_notifications()
    RETURNS INTEGER AS $$
    DECLARE
      deleted_count INTEGER;
    BEGIN
      -- Supprimer les notifications lues de plus de 30 jours
      DELETE FROM notifications 
      WHERE is_read = true 
      AND created_at < NOW() - INTERVAL '30 days';
      
      GET DIAGNOSTICS deleted_count = ROW_COUNT;
      RETURN deleted_count;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    await pool.query(queryText);
    console.log("✅ Fonction cleanup_old_notifications créée avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création de la fonction cleanup:",
      error
    );
    throw error;
  }
};

/**
 * Fonction pour exécuter le nettoyage des anciennes notifications
 * Peut être appelée manuellement ou programmée
 */
export const executeCleanupOldNotifications = async () => {
  try {
    const result = await pool.query("SELECT cleanup_old_notifications()");
    const deletedCount = result.rows[0].cleanup_old_notifications;
    console.log(
      `🧹 Nettoyage terminé: ${deletedCount} notifications supprimées`
    );
    return deletedCount;
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des notifications:", error);
    throw error;
  }
};

/**
 * Fonction pour supprimer toutes les fonctions et triggers de notifications
 * Utile pour la réinitialisation complète
 */
export const dropNotificationFunctions = async () => {
  const queries = [
    "DROP TRIGGER IF EXISTS trigger_notify_on_notification_insert ON notifications",
    "DROP FUNCTION IF EXISTS notify_on_notification_insert() CASCADE",
    "DROP FUNCTION IF EXISTS cleanup_old_notifications() CASCADE",
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log("✅ Fonctions et triggers de notifications supprimés");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des fonctions:", error);
    throw error;
  }
};

/**
 * Fonction principale pour initialiser toutes les fonctions de notifications
 */
export const initNotificationFunctions = async () => {
  try {
    console.log("🔧 Initialisation des fonctions de notifications...");
    await createNotificationTriggerFunction();
    await createNotificationTrigger();
    await createCleanupOldNotificationsFunction();
    console.log("✅ Toutes les fonctions de notifications initialisées");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des fonctions:", error);
    throw error;
  }
};

export default initNotificationFunctions;
