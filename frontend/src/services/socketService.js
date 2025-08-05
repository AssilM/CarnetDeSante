import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.notificationHandlers = new Map();
    this.typingHandlers = new Map();
    this.errorHandlers = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connecté au serveur WebSocket');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur WebSocket');
      this.isConnected = false;
    });

    this.socket.on('new_message', (message) => {
      this.notifyMessageHandlers('new_message', message);
    });

    this.socket.on('message_sent', (message) => {
      this.notifyMessageHandlers('message_sent', message);
    });

    this.socket.on('messages_read', (data) => {
      this.notifyMessageHandlers('messages_read', data);
    });

    this.socket.on('user_typing', (data) => {
      this.notifyTypingHandlers('user_typing', data);
    });

    this.socket.on('user_stop_typing', (data) => {
      this.notifyTypingHandlers('user_stop_typing', data);
    });

    this.socket.on('user_joined_conversation', (data) => {
      this.notifyMessageHandlers('user_joined_conversation', data);
    });

    this.socket.on('notification', (notification) => {
      this.notifyNotificationHandlers(notification);
    });

    this.socket.on('error', (error) => {
      this.notifyErrorHandlers(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Envoyer un message
  sendMessage(conversationId, content, type = 'text') {
    if (!this.isConnected) {
      console.error('Socket non connecté');
      return;
    }
    
    this.socket.emit('send_message', {
      conversationId,
      content,
      type
    });
  }

  // Rejoindre une conversation
  joinConversation(conversationId) {
    if (!this.isConnected) {
      console.error('Socket non connecté');
      return;
    }
    
    this.socket.emit('join_conversation', { conversationId });
  }

  // Quitter une conversation
  leaveConversation(conversationId) {
    if (!this.isConnected) {
      console.error('Socket non connecté');
      return;
    }
    
    this.socket.emit('leave_conversation', { conversationId });
  }

  // Indicateurs de frappe
  startTyping(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  // Marquer les messages comme lus
  markMessagesAsRead(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('mark_messages_read', { conversationId });
  }

  // Gestionnaires d'événements pour les messages
  onMessage(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  // Gestionnaires d'événements pour les notifications
  onNotification(handler) {
    this.notificationHandlers.set(handler, handler);
  }

  // Gestionnaires d'événements pour les indicateurs de frappe
  onTyping(event, handler) {
    if (!this.typingHandlers.has(event)) {
      this.typingHandlers.set(event, []);
    }
    this.typingHandlers.get(event).push(handler);
  }

  // Gestionnaires d'événements pour les erreurs
  onError(handler) {
    this.errorHandlers.set(handler, handler);
  }

  // Notifier les gestionnaires de messages
  notifyMessageHandlers(event, data) {
    const handlers = this.messageHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  // Notifier les gestionnaires de notifications
  notifyNotificationHandlers(notification) {
    this.notificationHandlers.forEach(handler => handler(notification));
  }

  // Notifier les gestionnaires de frappe
  notifyTypingHandlers(event, data) {
    const handlers = this.typingHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  // Notifier les gestionnaires d'erreurs
  notifyErrorHandlers(error) {
    this.errorHandlers.forEach(handler => handler(error));
  }

  // Supprimer un gestionnaire d'événement
  offMessage(event, handler) {
    const handlers = this.messageHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  offNotification(handler) {
    this.notificationHandlers.delete(handler);
  }

  offTyping(event, handler) {
    const handlers = this.typingHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  offError(handler) {
    this.errorHandlers.delete(handler);
  }

  // Vérifier l'état de la connexion
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

export default new SocketService(); 