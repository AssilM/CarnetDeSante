

import { io } from "socket.io-client";

class MessagingSocket {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentRoom = null;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.manualDisconnect = false; // Flag pour éviter les reconnexions automatiques
  }

  // === CONNEXION ===

  connect() {
    if (this.socket && this.socket.connected) {
      console.log("🔌 Socket.IO déjà connecté");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ Token manquant pour la connexion Socket.IO");
      return;
    }

    // Réinitialiser le flag de déconnexion manuelle
    this.manualDisconnect = false;

    console.log("🔌 Tentative de connexion Socket.IO");

    // Créer la connexion Socket.IO
    this.socket = io("http://localhost:5001", {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: false, // On gère la reconnexion manuellement
      timeout: 20000,
    });

    // Gérer les événements de connexion
    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connecté");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket.IO déconnecté:", reason);
      this.isConnected = false;
      this.currentRoom = null;
      this.emit("disconnect");

      // Tentative de reconnexion automatique seulement si ce n'est pas une déconnexion manuelle
      if (
        !this.manualDisconnect &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        console.log(
          `🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
        );
        setTimeout(
          () => this.connect(),
          this.reconnectDelay * this.reconnectAttempts
        );
      } else if (this.manualDisconnect) {
        console.log("🔌 Déconnexion manuelle - pas de reconnexion automatique");
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion Socket.IO:", error);
      this.emit("error", error);
    });

    // Gérer les messages reçus
    this.socket.on("connection_established", (data) => {
      console.log("✅ Connexion Socket.IO établie");
      this.emit("connection_established", data);
    });

    this.socket.on("room_joined", (data) => {
      console.log("🏠 Room rejointe:", data.conversationId);
      this.emit("room_joined", data);
    });

    this.socket.on("room_left", (data) => {
      console.log("👋 Room quittée:", data.conversationId);
      this.emit("room_left", data);
    });

    this.socket.on("new_message", (data) => {
      console.log("📨 Nouveau message reçu");
      this.emit("new_message", data);
    });

    this.socket.on("messages_read", (data) => {
      console.log("✅ Messages marqués comme lus");
      this.emit("messages_read", data);
    });

    this.socket.on("typing_start", (data) => {
      console.log("⌨️ Début de frappe détecté");
      this.emit("typing_start", data);
    });

    this.socket.on("typing_stop", (data) => {
      console.log("⏹️ Arrêt de frappe détecté");
      this.emit("typing_stop", data);
    });

    this.socket.on("error", (data) => {
      console.error("❌ Erreur Socket.IO:", data.message);
      this.emit("error", data);
    });
  }

  disconnect() {
    console.log("🔌 Déconnexion Socket.IO initiée");

    // Marquer comme déconnexion manuelle pour éviter les reconnexions automatiques
    this.manualDisconnect = true;

    if (this.socket) {
      // Fermer proprement la connexion
      if (this.socket.connected) {
        console.log("🔌 Fermeture propre de la connexion Socket.IO");
        this.socket.disconnect();
      } else {
        console.log(
          "🔌 Connexion Socket.IO déjà fermée ou en cours de fermeture"
        );
      }
      this.socket = null;
    }

    // Réinitialiser l'état
    this.isConnected = false;
    this.currentRoom = null;
    this.reconnectAttempts = 0;

    console.log("✅ Déconnexion Socket.IO terminée");
  }

  // === GESTION DES ROOMS ===

  joinRoom(conversationId) {
    if (!this.isConnected) {
      console.error("❌ Socket.IO non connecté");
      return;
    }

    // Quitter la room actuelle si on en a une
    if (this.currentRoom) {
      this.leaveRoom(this.currentRoom);
    }

    this.socket.emit("join_room", {
      conversationId: conversationId,
    });

    this.currentRoom = conversationId;
    console.log(`🏠 Rejoint la room: ${conversationId}`);
  }

  leaveRoom(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit("leave_room", {
      conversationId: conversationId,
    });

    if (this.currentRoom === conversationId) {
      this.currentRoom = null;
    }
    console.log(`👋 Quitté la room: ${conversationId}`);
  }

  // === ENVOI DE MESSAGES ===

  sendMessage(conversationId, content) {
    if (!this.isConnected) {
      console.error("❌ Socket.IO non connecté");
      return;
    }

    this.socket.emit("send_message", {
      conversationId: conversationId,
      content: content,
    });
  }

  markAsRead(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit("mark_as_read", {
      conversationId: conversationId,
    });
  }

  // === INDICATEURS DE FRAPPE ===

  startTyping(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit("typing_start", {
      conversationId: conversationId,
    });
  }

  stopTyping(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.socket.emit("typing_stop", {
      conversationId: conversationId,
    });
  }
  // === GESTION DES ÉVÉNEMENTS ===

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erreur dans le callback ${event}:`, error);
        }
      });
    }
  }

  // === ÉTAT ===

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentRoom: this.currentRoom,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Instance singleton
const messagingSocket = new MessagingSocket();

export default messagingSocket;
