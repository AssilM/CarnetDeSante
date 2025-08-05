import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, User, UserCheck, MessageCircle, Check, CheckCheck } from 'lucide-react';
import socketService from '../../../services/socketService';
import messagingService from '../../../services/api/messagingService';
import { useAuth } from '../../../context/AuthContext';
import UserPhoto from '../../common/UserPhoto';

const ChatWindow = ({ conversationId, recipientName, recipientRole, recipientUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { currentUser: user } = useAuth();

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    // Charger les messages existants
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const messages = await messagingService.getConversationMessages(conversationId);
        setMessages(Array.isArray(messages) ? messages : []);
        scrollToBottom();
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        setError('Erreur lors du chargement des messages');
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Rejoindre la conversation via WebSocket
    socketService.joinConversation(conversationId);

    // Écouter les nouveaux messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    const handleMessageSent = (message) => {
      // Le message a été envoyé avec succès
      console.log('Message envoyé:', message);
    };

    const handleMessagesRead = (data) => {
      // Mettre à jour les indicateurs de lecture pour les messages envoyés par l'utilisateur actuel
      setMessages(prev => prev.map(message => {
        if (message.sender_id === user?.id && !message.is_read) {
          return { ...message, is_read: true };
        }
        return message;
      }));
    };

    const handleUserTyping = (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => new Set([...prev, data.userName]));
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userName);
          return newSet;
        });
      }
    };

    const handleError = (error) => {
      setError(error.message);
    };

    // Ajouter les gestionnaires d'événements
    socketService.onMessage('new_message', handleNewMessage);
    socketService.onMessage('message_sent', handleMessageSent);
    socketService.onMessage('messages_read', handleMessagesRead);
    socketService.onTyping('user_typing', handleUserTyping);
    socketService.onTyping('user_stop_typing', handleUserStopTyping);
    socketService.onError(handleError);

    // Cleanup lors du démontage
    return () => {
      socketService.offMessage('new_message', handleNewMessage);
      socketService.offMessage('message_sent', handleMessageSent);
      socketService.offMessage('messages_read', handleMessagesRead);
      socketService.offTyping('user_typing', handleUserTyping);
      socketService.offTyping('user_stop_typing', handleUserStopTyping);
      socketService.offError(handleError);
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Envoyer le message via WebSocket
    socketService.sendMessage(conversationId, newMessage.trim());
    
    // Vider le champ de saisie
    setNewMessage('');
    
    // Arrêter l'indicateur de frappe
    handleStopTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(conversationId);
    }

    // Réinitialiser le timeout de frappe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(conversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnMessage = (message) => {
    return message.sender_id === user?.id;
  };

  const getRecipientUserData = () => {
    if (recipientUser) {
      return recipientUser;
    }
    // Fallback si recipientUser n'est pas fourni
    if (!recipientName) return null;
    // Extraire le prénom et nom du nom complet
    const nameParts = recipientName.split(' ');
    return {
      prenom: nameParts[0] || '',
      nom: nameParts.slice(1).join(' ') || '',
      role: recipientRole
    };
  };

  // Composant pour l'indicateur de lecture
  const ReadIndicator = ({ message }) => {
    if (!isOwnMessage(message)) return null;

    return (
      <div className="flex items-center space-x-1 mt-1">
        {message.is_read ? (
          <CheckCheck className="w-3 h-3 text-white-500" />
        ) : (
          <Check className="w-3 h-3 text-white-400" />
        )}
        <span className="text-xs text-white-500">
          {message.is_read ? 'Vu' : ''}
        </span>
      </div>
    );
  };

  // Attendre que l'utilisateur soit chargé
  if (!user) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Chargement...</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Chargement...</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserPhoto
            user={getRecipientUserData()}
            size="sm"
            className="flex-shrink-0"
            fallbackIcon={<UserCheck className="w-5 h-5 text-white" />}
          />
          <div>
            <h3 className="font-semibold text-gray-800">{recipientName}</h3>
            <p className="text-sm text-gray-500 capitalize">{recipientRole}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun message pour le moment</p>
              <p className="text-sm">Commencez la conversation en envoyant un message</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage(message)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs opacity-70">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                {/* Indicateur de lecture pour les messages envoyés */}
                {isOwnMessage(message) && (
                  <ReadIndicator message={message} />
                )}
              </div>
            </div>
          ))
        )}
        
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
              <p className="text-sm italic">
                {Array.from(typingUsers).join(', ')} tape...
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              onBlur={handleStopTyping}
              placeholder="Tapez votre message..."
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 