import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messagingRepository from "../messaging.repository.js";

dotenv.config();

class SocketIOServerManager {
  constructor() {
    this.io = null;
    this.userConnections = new Map(); // Map pour associer userId -> Set de socketIds
    this.socketToUser = new Map(); // Map pour associer socketId -> user
    this.userRooms = new Map(); // Map pour associer userId -> Set de rooms
  }

  // Initialiser le serveur Socket.IO
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:5173", // Frontend URL
        methods: ["GET", "POST"]
      }
    });

    // Middleware d'authentification
    this.io.use((socket, next) => {
      this.authenticateSocket(socket, next);
    });

    // Gérer les connexions
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });

    console.log("🔌 Serveur Socket.IO initialisé avec système de rooms");
  }

  // Authentifier un socket
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Token manquant"));
      }

      const user = await this.authenticateUser(token);
      if (!user) {
        return next(new Error("Token invalide"));
      }

      // Stocker les informations utilisateur dans le socket
      socket.user = user;
      next();
    } catch (error) {
      console.error("❌ Erreur d'authentification Socket.IO:", error);
      next(new Error("Erreur d'authentification"));
    }
  }

  // Authentifier l'utilisateur
  async authenticateUser(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        id: decoded.id,
        role: decoded.role,
      };
    } catch (error) {
      console.error("❌ Erreur d'authentification:", error);
      return null;
    }
  }

  // Gérer une nouvelle connexion
  handleConnection(socket) {
    const user = socket.user;

    console.log(`🔗 Utilisateur ${user.id} (${user.role}) connecté au Socket.IO`);

    // Stocker la connexion
    if (!this.userConnections.has(user.id)) {
      this.userConnections.set(user.id, new Set());
    }
    this.userConnections.get(user.id).add(socket.id);
    this.socketToUser.set(socket.id, user);

    // Initialiser les rooms de l'utilisateur
    if (!this.userRooms.has(user.id)) {
      this.userRooms.set(user.id, new Set());
    }

    // Envoyer un message de confirmation
    socket.emit("connection_established", {
      userId: user.id,
      userRole: user.role,
    });

    // Gérer les événements
    socket.on("join_room", (data) => {
      this.handleJoinRoom(socket, data, user);
    });

    socket.on("leave_room", (data) => {
      this.handleLeaveRoom(socket, data, user);
    });

    socket.on("send_message", (data) => {
      this.handleSendMessage(socket, data, user);
    });

    socket.on("mark_as_read", (data) => {
      this.handleMarkAsRead(socket, data, user);
    });

    socket.on("typing_start", (data) => {
      this.handleTypingStart(socket, data, user);
    });

    socket.on("typing_stop", (data) => {
      this.handleTypingStop(socket, data, user);
    });

    // Gérer la déconnexion
    socket.on("disconnect", () => {
      this.handleDisconnection(socket, user);
    });

    // Gérer les erreurs
    socket.on("error", (error) => {
      console.error("❌ Erreur Socket.IO:", error);
      this.handleDisconnection(socket, user);
    });
  }

  // Gérer l'adhésion à une room
  async handleJoinRoom(socket, data, user) {
    try {
      const { conversationId } = data;

      console.log("🔍 Tentative de rejoindre la room:", {
        conversationId,
        userId: user.id,
        userRole: user.role,
      });

      if (!conversationId) {
        socket.emit("error", {
          message: "conversationId requis pour rejoindre une room",
        });
        return;
      }

      // Vérifier l'accès à la conversation
      const conversation = await messagingRepository.getConversationById(
        conversationId
      );
      if (!conversation) {
        socket.emit("error", {
          message: "Conversation non trouvée",
        });
        return;
      }

      // Vérifier que l'utilisateur a accès à cette conversation
      if (user.role === "patient" && conversation.patient_id !== user.id) {
        socket.emit("error", {
          message: "Accès non autorisé à cette conversation",
        });
        return;
      }

      if (user.role === "medecin" && conversation.doctor_id !== user.id) {
        socket.emit("error", {
          message: "Accès non autorisé à cette conversation",
        });
        return;
      }

      // Rejoindre la room Socket.IO
      const roomKey = `conversation_${conversationId}`;
      socket.join(roomKey);

      // Ajouter la room à la liste des rooms de l'utilisateur
      if (!this.userRooms.has(user.id)) {
        this.userRooms.set(user.id, new Set());
      }
      this.userRooms.get(user.id).add(roomKey);

      socket.emit("room_joined", {
        conversationId: conversationId,
      });

      console.log(`👥 Utilisateur ${user.id} a rejoint la room ${conversationId}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'adhésion à la room:", error);
      socket.emit("error", {
        message: "Erreur lors de l'adhésion à la room",
      });
    }
  }

  // Gérer la sortie d'une room
  async handleLeaveRoom(socket, data, user) {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        socket.emit("error", {
          message: "conversationId requis pour quitter une room",
        });
        return;
      }

      // Quitter la room Socket.IO
      const roomKey = `conversation_${conversationId}`;
      socket.leave(roomKey);

      // Retirer la room de la liste des rooms de l'utilisateur
      if (this.userRooms.has(user.id)) {
        this.userRooms.get(user.id).delete(roomKey);
      }

      socket.emit("room_left", {
        conversationId: conversationId,
      });

      console.log(`👋 Utilisateur ${user.id} a quitté la room ${conversationId}`);
    } catch (error) {
      console.error("❌ Erreur lors de la sortie de la room:", error);
    }
  }

  // Gérer l'envoi d'un message
  async handleSendMessage(socket, data, user) {
    try {
      const { conversationId, content } = data;

      if (!conversationId || !content) {
        socket.emit("error", {
          message: "conversationId et content requis",
        });
        return;
      }

      // Vérifier l'accès à la conversation
      const conversation = await messagingRepository.getConversationById(
        conversationId
      );
      if (!conversation) {
        socket.emit("error", {
          message: "Conversation non trouvée",
        });
        return;
      }

      // Vérifier que l'utilisateur a accès à cette conversation
      if (user.role === "patient" && conversation.patient_id !== user.id) {
        socket.emit("error", {
          message: "Accès non autorisé à cette conversation",
        });
        return;
      }

      if (user.role === "medecin" && conversation.doctor_id !== user.id) {
        socket.emit("error", {
          message: "Accès non autorisé à cette conversation",
        });
        return;
      }

      // Créer le message en base
      const newMessage = await messagingRepository.createMessage(
        conversationId,
        user.id,
        content
      );

      // Récupérer les informations de l'expéditeur
      const senderInfo = {
        id: user.id,
        nom: conversation[
          user.role === "patient" ? "patient_nom" : "doctor_nom"
        ],
        prenom:
          conversation[
            user.role === "patient" ? "patient_prenom" : "doctor_prenom"
          ],
      };

      const messageToSend = {
        type: "new_message",
        message: {
          ...newMessage,
          sender_info: senderInfo,
        },
        conversationId: conversationId,
      };

      // Envoyer le message à tous les participants de la room (sauf l'expéditeur)
      socket.to(`conversation_${conversationId}`).emit("new_message", messageToSend);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du message:", error);
      socket.emit("error", {
        message: "Erreur lors de l'envoi du message",
      });
    }
  }

  // Gérer le marquage comme lu
  async handleMarkAsRead(socket, data, user) {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        socket.emit("error", {
          message: "conversationId requis",
        });
        return;
      }

      // Marquer les messages comme lus
      const updatedCount = await messagingRepository.markMessagesAsRead(
        conversationId,
        user.id
      );

      // Notifier les autres participants
      const notification = {
        type: "messages_read",
        conversationId: conversationId,
        userId: user.id,
        updatedCount: updatedCount,
      };

      socket.to(`conversation_${conversationId}`).emit("messages_read", notification);
    } catch (error) {
      console.error("❌ Erreur lors du marquage comme lu:", error);
      socket.emit("error", {
        message: "Erreur lors du marquage comme lu",
      });
    }
  }

  // Gérer le début de frappe
  async handleTypingStart(socket, data, user) {
    try {
      const { conversationId } = data;

      const notification = {
        type: "typing_start",
        conversationId: conversationId,
        userId: user.id,
      };

      socket.to(`conversation_${conversationId}`).emit("typing_start", notification);
    } catch (error) {
      console.error("❌ Erreur lors du début de frappe:", error);
    }
  }

  // Gérer l'arrêt de frappe
  async handleTypingStop(socket, data, user) {
    try {
      const { conversationId } = data;

      const notification = {
        type: "typing_stop",
        conversationId: conversationId,
        userId: user.id,
      };

      socket.to(`conversation_${conversationId}`).emit("typing_stop", notification);
    } catch (error) {
      console.error("❌ Erreur lors de l'arrêt de frappe:", error);
    }
  }

  // Envoyer un message à un utilisateur spécifique (pour les notifications)
  sendToUser(userId, event, data) {
    const userConnections = this.userConnections.get(userId);
    if (userConnections) {
      userConnections.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      });
    }
  }

  // Gérer la déconnexion
  handleDisconnection(socket, user) {
    if (!user) {
      console.log("🔌 Déconnexion d'un utilisateur non authentifié");
      return;
    }

    console.log(`🔌 Déconnexion de l'utilisateur ${user.id} (${user.role})`);

    // Nettoyer les connexions utilisateur
    if (this.userConnections.has(user.id)) {
      const connections = this.userConnections.get(user.id);
      connections.delete(socket.id);

      console.log(`📊 Connexions restantes pour ${user.id}: ${connections.size}`);

      // Supprimer l'utilisateur s'il n'a plus de connexions
      if (connections.size === 0) {
        this.userConnections.delete(user.id);
        console.log(`✅ Utilisateur ${user.id} complètement déconnecté`);
      }
    }

    // Nettoyer la map socketToUser
    this.socketToUser.delete(socket.id);

    // Nettoyer les rooms de cette connexion spécifique
    if (this.userRooms.has(user.id)) {
      const userRooms = this.userRooms.get(user.id);
      const roomsToClean = new Set(userRooms);

      roomsToClean.forEach((roomKey) => {
        // Socket.IO gère automatiquement la sortie des rooms lors de la déconnexion
        console.log(`🏠 Utilisateur ${user.id} retiré de la room ${roomKey}`);
      });

      // Nettoyer les rooms vides de la liste de l'utilisateur
      userRooms.forEach((roomKey) => {
        // Vérifier si la room est vide (optionnel avec Socket.IO)
      });

      // Supprimer la liste des rooms si l'utilisateur n'a plus de connexions
      if (
        this.userConnections.has(user.id) &&
        this.userConnections.get(user.id).size === 0
      ) {
        this.userRooms.delete(user.id);
        console.log(`🧹 Rooms nettoyées pour l'utilisateur ${user.id}`);
      }
    }

    // Logs de statistiques
    console.log(`📈 Statistiques après déconnexion:`);
    console.log(`  - Connexions totales: ${this.socketToUser.size}`);
    console.log(`  - Utilisateurs connectés: ${this.userConnections.size}`);
  }

  // Obtenir le nombre de connexions actives
  getConnectionCount() {
    return this.socketToUser.size;
  }

  // Obtenir le nombre d'utilisateurs connectés
  getUserCount() {
    return this.userConnections.size;
  }

  // Obtenir les statistiques du serveur
  getStats() {
    const stats = {
      connections: this.getConnectionCount(),
      users: this.getUserCount(),
      // Détails des connexions multiples
      multipleConnections: 0,
      connectionDetails: {},
    };

    // Analyser les connexions multiples
    this.userConnections.forEach((connections, userId) => {
      if (connections.size > 1) {
        stats.multipleConnections++;
        stats.connectionDetails[userId] = connections.size;
      }
    });

    return stats;
  }
}

// Instance singleton
const socketIOServer = new SocketIOServerManager();

export default socketIOServer;
