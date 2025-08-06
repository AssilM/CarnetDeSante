import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import messagingService from '../messaging/messaging.service.js';
import { createNotificationService } from '../notification/notification.service.js';

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });
    this.userSockets = new Map(); // userId -> socketId associe chaque utilisateur à son socket
    this.socketUsers = new Map(); // socketId -> userId associe chaque socket à son utilisateur
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentification des WebSockets
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Token manquant'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.userName = decoded.email; // Utiliser l'email comme nom par défaut
        next();
      } catch (error) {
        next(new Error('Token invalide'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Utilisateur connecté: ${socket.userId} (${socket.userRole}) - ${socket.userName}`);
      
      // Associer l'utilisateur à son socket
      this.userSockets.set(socket.userId, socket.id);
      this.socketUsers.set(socket.id, socket.userId);

      // Rejoindre les rooms appropriées
      socket.join(`user_${socket.userId}`);
      if (socket.userRole === 'medecin') {
        socket.join('doctors');
      } else if (socket.userRole === 'admin') {
        socket.join('admins');
      }

      // Gestion des messages de conversation
      socket.on('send_message', async (data) => {
        await this.handleConversationMessage(socket, data);
      });

      // Rejoindre une conversation
      socket.on('join_conversation', async (data) => {
        await this.handleJoinConversation(socket, data);
      });

      // Quitter une conversation
      socket.on('leave_conversation', (data) => {
        socket.leave(`conversation_${data.conversationId}`);
        console.log(`👤 Utilisateur ${socket.userId} a quitté la conversation ${data.conversationId}`);
      });

      // Typing indicators
      socket.on('typing_start', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName,
          conversationId: data.conversationId
        });
      });

      socket.on('typing_stop', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
          userId: socket.userId,
          conversationId: data.conversationId
        });
      });

      // Marquer les messages comme lus
      socket.on('mark_messages_read', async (data) => {
        await this.handleMarkMessagesRead(socket, data);
      });

      // Déconnexion
      socket.on('disconnect', () => {
        console.log(`🔌 Utilisateur déconnecté: ${socket.userId} - ${socket.userName}`);
        this.userSockets.delete(socket.userId);
        this.socketUsers.delete(socket.id);
      });
    });
  }

  async handleConversationMessage(socket, data) {
      const { conversationId, content, type = 'text' } = data;
      
      // Vérifier l'accès à la conversation
      const canAccess = await messagingService.canAccessConversation(conversationId, socket.userId);
      if (!canAccess) {
        socket.emit('error', { message: 'Accès non autorisé à cette conversation' });
        return;
      }

      // Sauvegarder le message en base de données
      const savedMessage = await messagingService.sendMessage(conversationId, socket.userId, content, type);
      
      // Obtenir les informations du destinataire
      const recipient = await messagingService.getMessageRecipient(conversationId, socket.userId);
      
      // Préparer le message pour l'envoi
      const messageToSend = {
        ...savedMessage,
        senderName: socket.userName,
        senderRole: socket.userRole,
        isOwn: false
      };

      // Envoyer le message à tous les participants de la conversation
      this.io.to(`conversation_${conversationId}`).emit('new_message', messageToSend);

      // Confirmation à l'expéditeur
      socket.emit('message_sent', {
        ...savedMessage,
        senderName: socket.userName,
        senderRole: socket.userRole,
        isOwn: true
      });

      // Envoyer une notification au destinataire s'il n'est pas dans la conversation
      const recipientSocketId = this.userSockets.get(recipient.recipient_id);
      if (!recipientSocketId || !this.io.sockets.sockets.get(recipientSocketId)?.rooms.has(`conversation_${conversationId}`)) {
        await createNotificationService(
          recipient.recipient_id,
          'new_message',
          'Nouveau message',
          `Nouveau message de ${socket.userName}`
        );
      }

      console.log(`💬 Message envoyé dans la conversation ${conversationId} par ${socket.userName}`);
    
  }

  async handleJoinConversation(socket, data) {
    try {
      const { conversationId } = data;
      
      // Vérifier l'accès à la conversation
      const canAccess = await messagingService.canAccessConversation(conversationId, socket.userId);
      if (!canAccess) {
        socket.emit('error', { message: 'Accès non autorisé à cette conversation' });
        return;
      }

      // Rejoindre la room de la conversation
      socket.join(`conversation_${conversationId}`);
      
      // Marquer les messages comme lus
      await messagingService.markMessagesAsRead(conversationId, socket.userId);
      
      // Notifier les autres participants que les messages ont été lus
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        userId: socket.userId,
        userName: socket.userName
      });
      
      console.log(`👤 Utilisateur ${socket.userId} a rejoint la conversation ${conversationId}`);
      
      // Notifier les autres participants
      socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
        userId: socket.userId,
        userName: socket.userName,
        conversationId
      });
    } catch (error) {
      console.error('Erreur lors de la jointure de la conversation:', error);
      socket.emit('error', { message: 'Erreur lors de la jointure de la conversation' });
    }
  }

  async handleMarkMessagesRead(socket, data) {
    try {
      const { conversationId } = data;
      
      // Vérifier l'accès à la conversation
      const canAccess = await messagingService.canAccessConversation(conversationId, socket.userId);
      if (!canAccess) {
        return;
      }

      // Marquer les messages comme lus
      await messagingService.markMessagesAsRead(conversationId, socket.userId);
      
      // Notifier les autres participants que les messages ont été lus
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        userId: socket.userId,
        userName: socket.userName
      });
      
      console.log(`👁️ Messages marqués comme lus pour l'utilisateur ${socket.userId} dans la conversation ${conversationId}`);
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  }

  // Méthodes utilitaires pour envoyer des notifications
  sendNotificationToUser(userId, notification) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  sendNotificationToRole(role, notification) {
    this.io.to(role + 's').emit('notification', notification);
  }

  // Obtenir le nombre d'utilisateurs connectés
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Obtenir la liste des utilisateurs connectés
  getConnectedUsers() {
    return Array.from(this.userSockets.keys());
  }

  // Vérifier si un utilisateur est connecté
  isUserConnected(userId) {
    return this.userSockets.has(userId);
  }
}

export default SocketServer; 