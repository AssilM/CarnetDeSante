import pool from "../config/db.js";

class NotificationRepository {
  // Créer une nouvelle notification
  async createNotification(notificationData) {
    const { utilisateur_id, type, titre, contenu } = notificationData;
    const query = `
      INSERT INTO notifications (utilisateur_id, type, titre, contenu)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [utilisateur_id, type, titre, contenu];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Récupérer toutes les notifications d'un utilisateur
  async getNotificationsByUser(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM notifications 
      WHERE utilisateur_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const values = [userId, limit, offset];
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Récupérer les notifications non lues d'un utilisateur
  async getUnreadNotificationsByUser(userId) {
    const query = `
      SELECT * FROM notifications 
      WHERE utilisateur_id = $1 AND is_read = false 
      ORDER BY created_at DESC
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Compter les notifications non lues d'un utilisateur
  async countUnreadNotificationsByUser(userId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE utilisateur_id = $1 AND is_read = false
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND utilisateur_id = $2 
      RETURNING *
    `;
    const values = [notificationId, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllNotificationsAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE utilisateur_id = $1 AND is_read = false 
      RETURNING *
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Supprimer une notification
  async deleteNotification(notificationId, userId) {
    const query = `
      DELETE FROM notifications 
      WHERE id = $1 AND utilisateur_id = $2 
      RETURNING *
    `;
    const values = [notificationId, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Supprimer toutes les notifications lues d'un utilisateur
  async deleteReadNotifications(userId) {
    const query = `
      DELETE FROM notifications 
      WHERE utilisateur_id = $1 AND is_read = true 
      RETURNING *
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Récupérer une notification par ID
  async getNotificationById(notificationId, userId) {
    const query = `
      SELECT * FROM notifications 
      WHERE id = $1 AND utilisateur_id = $2
    `;
    const values = [notificationId, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Récupérer les notifications par type
  async getNotificationsByType(userId, type, limit = 20) {
    const query = `
      SELECT * FROM notifications 
      WHERE utilisateur_id = $1 AND type = $2 
      ORDER BY created_at DESC 
      LIMIT $3
    `;
    const values = [userId, type, limit];
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Supprimer les anciennes notifications (plus de 30 jours)
  async deleteOldNotifications(daysOld = 30) {
    const query = `
      DELETE FROM notifications 
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      RETURNING *
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

export default new NotificationRepository();
