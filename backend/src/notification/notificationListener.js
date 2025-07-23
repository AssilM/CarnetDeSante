import pkg from "pg";
const { Client } = pkg;

class NotificationListener {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.hasNewNotifications = new Map(); // Map pour stocker les utilisateurs avec de nouvelles notifications
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 secondes
  }

  // Initialiser la connexion
  async connect() {
    try {
      this.client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      });

      await this.client.connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("🔔 NotificationListener connecté à PostgreSQL");

      // Écouter le canal 'new_notification'
      await this.client.query("LISTEN new_notification");
      console.log("🔔 Écoute du canal new_notification activée");

      // Configurer les gestionnaires d'événements
      this.setupEventHandlers();
    } catch (error) {
      console.error(
        "❌ Erreur lors de la connexion du NotificationListener:",
        error
      );
      this.isConnected = false;
      await this.handleReconnect();
    }
  }

  // Configurer les gestionnaires d'événements
  setupEventHandlers() {
    // Gestionnaire pour les notifications PostgreSQL
    this.client.on("notification", (msg) => {
      try {
        const userId = parseInt(msg.payload);
        console.log(`🔔 Nouvelle notification pour l'utilisateur ${userId}`);

        // Marque l'utilisateur comme ayant de nouvelles notifications
        this.hasNewNotifications.set(userId, true);

        // Optionnel : Log pour debug
        console.log(
          `📊 Utilisateurs avec nouvelles notifications: ${this.hasNewNotifications.size}`
        );
      } catch (error) {
        console.error(
          "❌ Erreur lors du traitement de la notification:",
          error
        );
      }
    });

    // Gestionnaire pour les erreurs de connexion
    this.client.on("error", async (error) => {
      console.error("❌ Erreur de connexion NotificationListener:", error);
      this.isConnected = false;
      await this.handleReconnect();
    });

    // Gestionnaire pour la déconnexion
    this.client.on("end", async () => {
      console.log("🔌 NotificationListener déconnecté");
      this.isConnected = false;
      await this.handleReconnect();
    });
  }

  // Gérer la reconnexion automatique
  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Nombre maximum de tentatives de reconnexion atteint");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 Tentative de reconnexion ${this.reconnectAttempts}/${
        this.maxReconnectAttempts
      } dans ${this.reconnectDelay / 1000}s...`
    );

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error("❌ Échec de la reconnexion:", error);
      }
    }, this.reconnectDelay);
  }

  // Vérifier si un utilisateur a de nouvelles notifications
  hasNewNotificationsForUser(userId) {
    return this.hasNewNotifications.get(userId) || false;
  }

  // Marquer les notifications comme vérifiées pour un utilisateur
  markNotificationsChecked(userId) {
    this.hasNewNotifications.set(userId, false);
  }

  // Obtenir le nombre d'utilisateurs avec de nouvelles notifications
  getUsersWithNewNotificationsCount() {
    return this.hasNewNotifications.size;
  }

  // Obtenir la liste des utilisateurs avec de nouvelles notifications
  getUsersWithNewNotifications() {
    return Array.from(this.hasNewNotifications.keys());
  }

  // Vider toutes les notifications (utile pour les tests)
  clearAllNotifications() {
    this.hasNewNotifications.clear();
  }

  // Arrêter le listener
  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.query("UNLISTEN new_notification");
        await this.client.end();
        this.isConnected = false;
        console.log("🔌 NotificationListener déconnecté proprement");
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la déconnexion du NotificationListener:",
        error
      );
    }
  }

  // Vérifier l'état de la connexion
  isListenerConnected() {
    return this.isConnected && this.client && !this.client.ended;
  }

  // Obtenir des statistiques du listener
  getStats() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      usersWithNewNotifications: this.hasNewNotifications.size,
      totalUsers: this.hasNewNotifications.size,
    };
  }
}

// Créer une instance singleton
const notificationListener = new NotificationListener();

export default notificationListener;
