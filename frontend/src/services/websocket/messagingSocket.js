/**
 * Client WebSocket pour la messagerie
 * Gère la connexion WebSocket et les communications en temps réel
 */

class MessagingSocket {
  constructor() {
    this.ws = null;
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
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("🔌 WebSocket déjà connecté");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ Token manquant pour la connexion WebSocket");
      return;
    }

    // Réinitialiser le flag de déconnexion manuelle
    this.manualDisconnect = false;

    const wsUrl = `ws://localhost:5001?token=${token}`;
    console.log("🔌 Tentative de connexion WebSocket:", wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("✅ WebSocket connecté");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("connect");
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Message WebSocket reçu:", data);
        this.handleMessage(data);
      } catch (error) {
        console.error("❌ Erreur lors du parsing du message WebSocket:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("🔌 WebSocket déconnecté:", event.code, event.reason);
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
    };

    this.ws.onerror = (error) => {
      console.error("❌ Erreur WebSocket:", error);
      this.emit("error", error);
    };
  }

  disconnect() {
    console.log("🔌 Déconnexion WebSocket initiée");

    // Marquer comme déconnexion manuelle pour éviter les reconnexions automatiques
    this.manualDisconnect = true;

    if (this.ws) {
      // Fermer proprement la connexion
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log("🔌 Fermeture propre de la connexion WebSocket");
        this.ws.close(1000, "Déconnexion utilisateur");
      } else {
        console.log(
          "🔌 Connexion WebSocket déjà fermée ou en cours de fermeture"
        );
      }
      this.ws = null;
    }

    // Réinitialiser l'état
    this.isConnected = false;
    this.currentRoom = null;
    this.reconnectAttempts = 0;

    console.log("✅ Déconnexion WebSocket terminée");
  }

  // === GESTION DES ROOMS ===

  joinRoom(conversationId) {
    if (!this.isConnected) {
      console.error("❌ WebSocket non connecté");
      return;
    }

    // Quitter la room actuelle si on en a une
    if (this.currentRoom) {
      this.leaveRoom(this.currentRoom);
    }

    this.send({
      type: "join_room",
      conversationId: conversationId,
    });

    this.currentRoom = conversationId;
    console.log(`🏠 Rejoint la room: ${conversationId}`);
  }

  leaveRoom(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.send({
      type: "leave_room",
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
      console.error("❌ WebSocket non connecté");
      return;
    }

    this.send({
      type: "send_message",
      conversationId: conversationId,
      content: content,
    });
  }

  markAsRead(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.send({
      type: "mark_as_read",
      conversationId: conversationId,
    });
  }

  // === INDICATEURS DE FRAPPE ===

  startTyping(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.send({
      type: "typing_start",
      conversationId: conversationId,
    });
  }

  stopTyping(conversationId) {
    if (!this.isConnected) {
      return;
    }

    this.send({
      type: "typing_stop",
      conversationId: conversationId,
    });
  }

  // === UTILITAIRES ===

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("❌ WebSocket non connecté pour l'envoi");
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case "connection_established":
        console.log("✅ Connexion WebSocket établie");
        this.emit("connection_established", data);
        break;

      case "room_joined":
        console.log("🏠 Room rejointe:", data.conversationId);
        this.emit("room_joined", data);
        break;

      case "room_left":
        console.log("👋 Room quittée:", data.conversationId);
        this.emit("room_left", data);
        break;

      case "new_message":
        console.log("📨 Nouveau message reçu");
        this.emit("new_message", data);
        break;

      case "messages_read":
        console.log("✅ Messages marqués comme lus");
        this.emit("messages_read", data);
        break;

      case "typing_start":
        console.log("⌨️ Début de frappe détecté");
        this.emit("typing_start", data);
        break;

      case "typing_stop":
        console.log("⏹️ Arrêt de frappe détecté");
        this.emit("typing_stop", data);
        break;

      case "error":
        console.error("❌ Erreur WebSocket:", data.message);
        this.emit("error", data);
        break;

      default:
        console.log("📨 Message WebSocket non reconnu:", data);
        this.emit("message", data);
    }
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
