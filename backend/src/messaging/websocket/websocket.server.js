import { WebSocketServer } from "ws";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messagingRepository from "../messaging.repository.js";

dotenv.config();

class WebSocketServerManager {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map pour stocker les connexions clients
    this.userConnections = new Map(); // Map pour associer userId -> WebSocket
    this.rooms = new Map(); // Map pour gérer les rooms par conversation
    this.userRooms = new Map(); // Map pour associer userId -> Set de rooms
  }

  // Initialiser le serveur WebSocket
  initialize(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log("🔌 Serveur WebSocket initialisé avec système de rooms");
  }

  // Gérer une nouvelle connexion
  async handleConnection(ws, req) {
    try {
      // Authentifier l'utilisateur via token
      const token = this.extractToken(req);
      if (!token) {
        ws.close(1008, "Token manquant");
        return;
      }

      const user = await this.authenticateUser(token);
      if (!user) {
        ws.close(1008, "Token invalide");
        return;
      }

      // Stocker la connexion
      this.clients.set(ws, {
        userId: user.id,
        userRole: user.role,
        ws: ws,
      });

      // Associer l'utilisateur à sa connexion WebSocket
      if (!this.userConnections.has(user.id)) {
        this.userConnections.set(user.id, new Set());
      }
      this.userConnections.get(user.id).add(ws);

      // Initialiser les rooms de l'utilisateur
      if (!this.userRooms.has(user.id)) {
        this.userRooms.set(user.id, new Set());
      }

      console.log(
        `🔗 Utilisateur ${user.id} (${user.role}) connecté au WebSocket`
      );

      // Envoyer un message de confirmation
      ws.send(
        JSON.stringify({
          type: "connection_established",
          userId: user.id,
          userRole: user.role,
        })
      );

      // Gérer les messages reçus
      ws.on("message", (data) => {
        this.handleMessage(ws, data, user);
      });

      // Gérer la déconnexion
      ws.on("close", () => {
        this.handleDisconnection(ws, user);
      });

      // Gérer les erreurs
      ws.on("error", (error) => {
        console.error("❌ Erreur WebSocket:", error);
        this.handleDisconnection(ws, user);
      });
    } catch (error) {
      console.error("❌ Erreur lors de la connexion WebSocket:", error);
      ws.close(1011, "Erreur d'authentification");
    }
  }

  // Extraire le token de la requête
  extractToken(req) {
    // Essayer d'extraire le token des headers
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Essayer d'extraire le token des query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get("token");
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
      console.error("❌ Erreur d'authentification WebSocket:", error);
      return null;
    }
  }

  // Gérer les messages reçus
  async handleMessage(ws, data, user) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case "join_room":
          await this.handleJoinRoom(ws, message, user);
          break;

        case "leave_room":
          await this.handleLeaveRoom(ws, message, user);
          break;

        case "send_message":
          await this.handleSendMessage(ws, message, user);
          break;

        case "mark_as_read":
          await this.handleMarkAsRead(ws, message, user);
          break;

        case "typing_start":
          await this.handleTypingStart(ws, message, user);
          break;

        case "typing_stop":
          await this.handleTypingStop(ws, message, user);
          break;

        default:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Type de message non reconnu",
            })
          );
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors du traitement du message WebSocket:",
        error
      );
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Erreur lors du traitement du message",
        })
      );
    }
  }

  // Gérer l'adhésion à une room
  async handleJoinRoom(ws, message, user) {
    try {
      const { conversationId } = message;

      console.log("🔍 Tentative de rejoindre la room:", {
        conversationId,
        userId: user.id,
        userRole: user.role,
      });

      if (!conversationId) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "conversationId requis pour rejoindre une room",
          })
        );
        return;
      }

      // Vérifier l'accès à la conversation
      const conversation = await messagingRepository.getConversationById(
        conversationId
      );
      if (!conversation) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Conversation non trouvée",
          })
        );
        return;
      }

      console.log("🔍 Conversation trouvée:", {
        conversationId: conversation.id,
        patientId: conversation.patient_id,
        doctorId: conversation.doctor_id,
        userId: user.id,
        userRole: user.role,
      });

      // Vérifier que l'utilisateur a accès à cette conversation
      if (user.role === "patient" && conversation.patient_id !== user.id) {
        console.log("❌ Accès refusé - patient:", {
          conversationPatientId: conversation.patient_id,
          userId: user.id,
          types: {
            conversationPatientId: typeof conversation.patient_id,
            userId: typeof user.id,
          },
        });
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Accès non autorisé à cette conversation",
          })
        );
        return;
      }

      if (user.role === "medecin" && conversation.doctor_id !== user.id) {
        console.log("❌ Accès refusé - médecin:", {
          conversationDoctorId: conversation.doctor_id,
          userId: user.id,
          types: {
            conversationDoctorId: typeof conversation.doctor_id,
            userId: typeof user.id,
          },
        });
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Accès non autorisé à cette conversation",
          })
        );
        return;
      }

      // Rejoindre la room
      this.joinRoom(user.id, conversationId, ws);

      ws.send(
        JSON.stringify({
          type: "room_joined",
          conversationId: conversationId,
        })
      );

      console.log(
        `👥 Utilisateur ${user.id} a rejoint la room ${conversationId}`
      );
    } catch (error) {
      console.error("❌ Erreur lors de l'adhésion à la room:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Erreur lors de l'adhésion à la room",
        })
      );
    }
  }

  // Gérer la sortie d'une room
  async handleLeaveRoom(ws, message, user) {
    try {
      const { conversationId } = message;

      if (!conversationId) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "conversationId requis pour quitter une room",
          })
        );
        return;
      }

      // Quitter la room
      this.leaveRoom(user.id, conversationId, ws);

      ws.send(
        JSON.stringify({
          type: "room_left",
          conversationId: conversationId,
        })
      );

      console.log(
        `👋 Utilisateur ${user.id} a quitté la room ${conversationId}`
      );
    } catch (error) {
      console.error("❌ Erreur lors de la sortie de la room:", error);
    }
  }

  // Rejoindre une room
  joinRoom(userId, conversationId, ws) {
    const roomKey = `conversation_${conversationId}`;

    // Créer la room si elle n'existe pas
    if (!this.rooms.has(roomKey)) {
      this.rooms.set(roomKey, new Set());
    }

    // Ajouter le WebSocket à la room
    this.rooms.get(roomKey).add(ws);

    // Ajouter la room à la liste des rooms de l'utilisateur
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(roomKey);

    console.log(`🏠 Room ${roomKey} créée/jointe par l'utilisateur ${userId}`);
  }

  // Quitter une room
  leaveRoom(userId, conversationId, ws) {
    const roomKey = `conversation_${conversationId}`;

    // Retirer le WebSocket de la room
    if (this.rooms.has(roomKey)) {
      this.rooms.get(roomKey).delete(ws);

      // Supprimer la room si elle est vide
      if (this.rooms.get(roomKey).size === 0) {
        this.rooms.delete(roomKey);
        console.log(`🗑️ Room ${roomKey} supprimée (vide)`);
      }
    }

    // Retirer la room de la liste des rooms de l'utilisateur
    if (this.userRooms.has(userId)) {
      this.userRooms.get(userId).delete(roomKey);
    }
  }

  // Gérer l'envoi d'un message
  async handleSendMessage(ws, message, user) {
    try {
      const { conversationId, content } = message;

      if (!conversationId || !content) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "conversationId et content requis",
          })
        );
        return;
      }

      // Vérifier l'accès à la conversation
      const conversation = await messagingRepository.getConversationById(
        conversationId
      );
      if (!conversation) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Conversation non trouvée",
          })
        );
        return;
      }

      // Vérifier que l'utilisateur a accès à cette conversation
      if (user.role === "patient" && conversation.patient_id !== user.id) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Accès non autorisé à cette conversation",
          })
        );
        return;
      }

      if (user.role === "medecin" && conversation.doctor_id !== user.id) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Accès non autorisé à cette conversation",
          })
        );
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

      // Envoyer le message uniquement aux participants de la room
      this.broadcastToRoom(conversationId, messageToSend, user.id);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Erreur lors de l'envoi du message",
        })
      );
    }
  }

  // Gérer le marquage comme lu
  async handleMarkAsRead(ws, message, user) {
    try {
      const { conversationId } = message;

      if (!conversationId) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "conversationId requis",
          })
        );
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

      this.broadcastToRoom(conversationId, notification, user.id);
    } catch (error) {
      console.error("❌ Erreur lors du marquage comme lu:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Erreur lors du marquage comme lu",
        })
      );
    }
  }

  // Gérer le début de frappe
  async handleTypingStart(ws, message, user) {
    try {
      const { conversationId } = message;

      const notification = {
        type: "typing_start",
        conversationId: conversationId,
        userId: user.id,
      };

      this.broadcastToRoom(conversationId, notification, user.id);
    } catch (error) {
      console.error("❌ Erreur lors du début de frappe:", error);
    }
  }

  // Gérer l'arrêt de frappe
  async handleTypingStop(ws, message, user) {
    try {
      const { conversationId } = message;

      const notification = {
        type: "typing_stop",
        conversationId: conversationId,
        userId: user.id,
      };

      this.broadcastToRoom(conversationId, notification, user.id);
    } catch (error) {
      console.error("❌ Erreur lors de l'arrêt de frappe:", error);
    }
  }

  // Diffuser un message à tous les participants d'une room
  broadcastToRoom(conversationId, message, excludeUserId = null) {
    try {
      const roomKey = `conversation_${conversationId}`;
      const room = this.rooms.get(roomKey);

      if (room) {
        room.forEach((ws) => {
          if (ws.readyState === 1) {
            // WebSocket.OPEN
            ws.send(JSON.stringify(message));
          }
        });

        console.log(
          `📢 Message diffusé dans la room ${roomKey} à ${room.size} participants`
        );
      } else {
        console.log(`⚠️ Room ${roomKey} non trouvée pour la diffusion`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la diffusion dans la room:", error);
    }
  }

  // Envoyer un message à un utilisateur spécifique (pour les notifications)
  sendToUser(userId, message) {
    const userConnections = this.userConnections.get(userId);
    if (userConnections) {
      userConnections.forEach((ws) => {
        if (ws.readyState === 1) {
          // WebSocket.OPEN
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  // Gérer la déconnexion
  handleDisconnection(ws, user) {
    // Supprimer la connexion des maps
    this.clients.delete(ws);

    if (user && this.userConnections.has(user.id)) {
      this.userConnections.get(user.id).delete(ws);

      // Supprimer l'entrée si plus de connexions
      if (this.userConnections.get(user.id).size === 0) {
        this.userConnections.delete(user.id);
      }
    }

    // Retirer l'utilisateur de toutes ses rooms
    if (user && this.userRooms.has(user.id)) {
      const userRooms = this.userRooms.get(user.id);
      userRooms.forEach((roomKey) => {
        if (this.rooms.has(roomKey)) {
          this.rooms.get(roomKey).delete(ws);

          // Supprimer la room si elle est vide
          if (this.rooms.get(roomKey).size === 0) {
            this.rooms.delete(roomKey);
            console.log(`🗑️ Room ${roomKey} supprimée (déconnexion)`);
          }
        }
      });
      this.userRooms.delete(user.id);
    }

    console.log(`🔌 Utilisateur ${user?.id} déconnecté du WebSocket`);
  }

  // Obtenir le nombre de connexions actives
  getConnectionCount() {
    return this.clients.size;
  }

  // Obtenir le nombre d'utilisateurs connectés
  getUserCount() {
    return this.userConnections.size;
  }

  // Obtenir le nombre de rooms actives
  getRoomCount() {
    return this.rooms.size;
  }

  // Obtenir les statistiques du serveur
  getStats() {
    return {
      connections: this.getConnectionCount(),
      users: this.getUserCount(),
      rooms: this.getRoomCount(),
    };
  }
}

// Instance singleton
const webSocketServer = new WebSocketServerManager();

export default webSocketServer;
