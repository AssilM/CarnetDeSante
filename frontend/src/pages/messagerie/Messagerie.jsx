import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { createMessagingService } from "../../services/api";
import { httpService } from "../../services";
import messagingSocket from "../../services/websocket/messagingSocket";
import ContactSelectionModal from "../../components/messagerie/ContactSelectionModal";
import ConversationList from "../../components/messagerie/ConversationList";
import ChatArea from "../../components/messagerie/ChatArea";
import MobileHeader from "../../components/messagerie/MobileHeader";
import MobileInput from "../../components/messagerie/MobileInput";
import TypingIndicator from "../../components/messagerie/TypingIndicator";
import MessageBubble from "../../components/messagerie/MessageBubble";
import { FaPlus } from "react-icons/fa";

const messagingService = createMessagingService(httpService);

const Messagerie = () => {
  const { currentUser } = useAuth();
  const { isSidebarExpanded } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [error, setError] = useState(null);
  const [refreshingConversation, setRefreshingConversation] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Afficher l'erreur si elle existe
  useEffect(() => {
    if (error) {
      console.error("Erreur messagerie:", error);
      // Ici on pourrait afficher une notification d'erreur
    }
  }, [error]);

  // Initialiser la connexion Socket.IO
  useEffect(() => {
    if (currentUser) {
      console.log("👤 Utilisateur connecté:", currentUser);
      messagingSocket.connect();

      // Écouter les événements Socket.IO
      messagingSocket.on("new_message", handleNewMessage);
      messagingSocket.on("messages_read", handleMessageRead);
      messagingSocket.on("room_joined", handleRoomJoined);
      messagingSocket.on("user_joined_room", handleUserJoinedRoom);
      messagingSocket.on("typing_start", handleTypingStart);
      messagingSocket.on("typing_stop", handleTypingStop);
      messagingSocket.on("error", handleSocketError);
      messagingSocket.on("connect", () => {
        console.log("✅ Socket.IO connecté - mise à jour de l'état");
        setSocketConnected(true);

        // Rejoindre les rooms après la connexion Socket.IO
        if (conversations.length > 0) {
          conversations.forEach((conversation) => {
            messagingSocket.joinRoom(conversation.id);
          });
        }
      });
      messagingSocket.on("disconnect", () => {
        console.log("❌ Socket.IO déconnecté - mise à jour de l'état");
        setSocketConnected(false);
      });

      return () => {
        messagingSocket.off("new_message", handleNewMessage);
        messagingSocket.off("messages_read", handleMessageRead);
        messagingSocket.off("room_joined", handleRoomJoined);
        messagingSocket.off("user_joined_room", handleUserJoinedRoom);
        messagingSocket.off("typing_start", handleTypingStart);
        messagingSocket.off("typing_stop", handleTypingStop);
        messagingSocket.off("error", handleSocketError);
        messagingSocket.off("connect");
        messagingSocket.off("disconnect");

        // Cleanup du timeout de frappe
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [currentUser, conversations]);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent ou quand l'indicateur de frappe apparaît
  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Gérer les nouveaux messages
  const handleNewMessage = (messageData) => {
    console.log("📨 Nouveau message reçu via Socket.IO:", messageData);

    // Vérifier si le message vient de l'utilisateur actuel
    const isFromCurrentUser = messageData.message.sender_id === currentUser.id;

    // Si la conversation est actuellement sélectionnée ET que le message ne vient pas de l'utilisateur actuel
    if (
      selectedConversation &&
      messageData.conversationId === selectedConversation.id &&
      !isFromCurrentUser
    ) {
      // Ajouter le message à la liste locale pour l'affichage dans le chat principal
      setMessages((prev) => [...prev, messageData.message]);

      // Marquer automatiquement comme lus si on a la conversation ouverte
      setTimeout(() => {
        messagingSocket.markAsRead(messageData.conversationId);
      }, 100);
    }

    // Mettre à jour la conversation dans la liste (pour tous les cas)
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === messageData.conversationId
          ? {
              ...conv,
              last_message: messageData.message.content,
              updated_at: messageData.message.sent_at,
              // Incrémenter le compteur de messages non lus si la conversation n'est pas sélectionnée
              unread_count:
                selectedConversation?.id === messageData.conversationId
                  ? conv.unread_count
                  : (conv.unread_count || 0) + 1,
            }
          : conv
      )
    );
  };

  // Gérer les erreurs Socket.IO
  const handleSocketError = (error) => {
    console.error("Erreur Socket.IO:", error);
    setSocketConnected(false);
  };

  // Gérer la mise à jour du statut de lecture d'un message
  const handleMessageRead = (data) => {
    console.log("✅ Messages marqués comme lus:", data);

    // Si c'est l'autre utilisateur qui a lu nos messages, mettre à jour tous nos messages non lus
    if (data.userId !== currentUser.id) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          // Marquer comme lu tous nos messages qui ne sont pas encore lus
          if (msg.sender_id === currentUser.id && !msg.is_read) {
            return { ...msg, is_read: true };
          }
          return msg;
        })
      );
    }
  };

  // Gérer l'événement de rejoindre une room
  const handleRoomJoined = (data) => {
    console.log("🏠 Room rejointe:", data.conversationId);

    // Marquer automatiquement les messages comme lus quand on rejoint une room
    if (data.conversationId === selectedConversation?.id) {
      messagingSocket.markAsRead(data.conversationId);
    }
  };

  // Gérer l'événement quand un autre utilisateur rejoint la room
  const handleUserJoinedRoom = (data) => {
    console.log("👤 Utilisateur rejoint la room:", data);

    // Si l'autre utilisateur rejoint la room et qu'on a la conversation ouverte,
    // marquer nos messages comme lus
    if (
      data.conversationId === selectedConversation?.id &&
      data.userId !== currentUser.id
    ) {
      setTimeout(() => {
        messagingSocket.markAsRead(data.conversationId);
      }, 200);
    }
  };

  // Gérer le début de frappe
  const handleTypingStart = (data) => {
    console.log("⌨️ Début de frappe:", data);
    if (data.userId !== currentUser.id) {
      setTypingUsers((prev) => new Set([...prev, data.userId]));
    }
  };

  // Gérer l'arrêt de frappe
  const handleTypingStop = (data) => {
    console.log("⏹️ Arrêt de frappe:", data);
    if (data.userId !== currentUser.id) {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  };

  // Fonction optimisée pour gérer la frappe avec debounce
  const handleTyping = () => {
    if (!selectedConversation) return;

    // Si on n'est pas déjà en train d'écrire, envoyer l'événement de début
    if (!isTyping) {
      setIsTyping(true);
      messagingSocket.startTyping(selectedConversation.id);
    }

    // Clear le timeout précédent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Définir un nouveau timeout pour arrêter l'indicateur
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      messagingSocket.stopTyping(selectedConversation.id);
    }, 7000); // Arrêter après 7 secondes d'inactivité
  };

  // Charger les conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getConversations();
      setConversations(response.conversations || []);

      // Rejoindre automatiquement toutes les rooms des conversations seulement si Socket.IO est connecté
      if (
        socketConnected &&
        response.conversations &&
        response.conversations.length > 0
      ) {
        response.conversations.forEach((conversation) => {
          messagingSocket.joinRoom(conversation.id);
        });
      }
    } catch (err) {
      console.error("Erreur lors du chargement des conversations:", err);
      setError("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  // Gérer la création d'une nouvelle conversation
  const handleConversationCreated = async (newConversation) => {
    try {
      setLoading(true);
      await loadConversations();

      // Trouver la conversation mise à jour dans la liste rechargée
      const response = await messagingService.getConversations();
      const updatedConversations = response.conversations || [];
      const updatedConversation = updatedConversations.find(
        (conv) => conv.id === newConversation.id
      );

      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        setConversations(updatedConversations);
      } else {
        // Fallback si la conversation n'est pas trouvée
        setSelectedConversation(newConversation);
      }

      loadMessages(newConversation.id);
    } catch (err) {
      console.error("Erreur lors de la création de la conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId) => {
    try {
      const response = await messagingService.getConversationMessages(
        conversationId
      );
      setMessages(response.messages || []);

      // Rejoindre la room Socket.IO
      messagingSocket.joinRoom(conversationId);

      // Marquer les messages comme lus via Socket.IO (avec un délai pour s'assurer que la room est rejointe)
      setTimeout(() => {
        messagingSocket.markAsRead(conversationId);
      }, 500);
    } catch (err) {
      console.error("Erreur lors du chargement des messages:", err);
    }
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      setSending(true);

      // Créer un message temporaire pour l'affichage immédiat
      const tempMessage = {
        id: Date.now(), // ID temporaire
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        content: message.trim(),
        sent_at: new Date().toISOString(),
        is_read: false,
        sender_info: {
          id: currentUser.id,
          nom: currentUser.nom,
          prenom: currentUser.prenom,
        },
      };

      // Ajouter le message à la liste locale immédiatement
      setMessages((prev) => [...prev, tempMessage]);

      // Vider le champ de saisie immédiatement pour une meilleure UX
      setMessage("");

      // Arrêter l'indicateur de frappe
      messagingSocket.stopTyping(selectedConversation.id);

      // Envoyer via Socket.IO (le serveur Socket.IO gère la création en base)
      messagingSocket.sendMessage(selectedConversation.id, tempMessage.content);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
    } finally {
      setSending(false);
    }
  };

  // Sélectionner une conversation
  const handleSelectConversation = async (conversation) => {
    try {
      setRefreshingConversation(true);

      // Recharger les conversations pour avoir les données les plus récentes
      const response = await messagingService.getConversations();
      const updatedConversations = response.conversations || [];

      // Trouver la conversation mise à jour
      const updatedConversation = updatedConversations.find(
        (conv) => conv.id === conversation.id
      );

      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        setConversations(updatedConversations);
      } else {
        // Fallback si la conversation n'est pas trouvée
        setSelectedConversation(conversation);
      }

      loadMessages(conversation.id);

      // Réinitialiser le compteur de messages non lus pour cette conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Erreur lors du rechargement des conversations:", err);
      // En cas d'erreur, utiliser la conversation de base
      setSelectedConversation(conversation);
      loadMessages(conversation.id);
    } finally {
      setRefreshingConversation(false);
    }
  };

  // Gérer la sélection d'un contact
  const handleContactSelect = async (user) => {
    try {
      console.log("🔍 Sélection d'un contact:", user);
      console.log("🔍 ID de l'utilisateur sélectionné:", user.id);

      setLoading(true);
      const response = await messagingService.createConversation(user.id);
      await handleConversationCreated(response.conversation);
    } catch (err) {
      console.error("Erreur lors de la création de la conversation:", err);
      setError("Impossible de créer la conversation");
    } finally {
      setLoading(false);
    }
  };

  // Archiver une conversation
  const handleArchiveConversation = async (conversationId) => {
    try {
      await messagingService.archiveConversation(conversationId);

      // Retirer la conversation de la liste
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      // Si la conversation archivée était sélectionnée, désélectionner
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      console.log("✅ Conversation archivée avec succès");
    } catch (err) {
      console.error("Erreur lors de l'archivage de la conversation:", err);
      setError("Impossible d'archiver la conversation");
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Obtenir le nom de l'autre utilisateur dans une conversation
  const getOtherUserName = (conversation) => {
    if (!conversation) return "Utilisateur inconnu";

    if (currentUser.role === "patient") {
      return (
        `${conversation.doctor_prenom || ""} ${
          conversation.doctor_nom || ""
        }`.trim() || "Médecin inconnu"
      );
    } else {
      return (
        `${conversation.patient_prenom || ""} ${
          conversation.patient_nom || ""
        }`.trim() || "Patient inconnu"
      );
    }
  };

  // Obtenir l'avatar de l'autre utilisateur
  const getOtherUserAvatar = (conversation) => {
    if (currentUser.role === "patient") {
      return conversation.doctor_photo;
    } else {
      return conversation.patient_photo;
    }
  };

  // Gérer l'expansion/réduction d'un message
  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  return (
    <div
      className={`h-full bg-gray-50 transition-all duration-300 ${
        isSidebarExpanded ? "md:pl-72" : "md:pl-20"
      }`}
    >
      {/* Mobile Layout */}
      <div className="h-full flex flex-col md:hidden">
        {/* Header Mobile */}
        <MobileHeader
          selectedConversation={selectedConversation}
          onBack={() => setSelectedConversation(null)}
          onNewConversation={() => setShowContactModal(true)}
          getOtherUserName={getOtherUserName}
          getOtherUserAvatar={getOtherUserAvatar}
          refreshingConversation={refreshingConversation}
        />

        {/* Content Mobile */}
        <div className="flex-1 overflow-hidden">
          {!selectedConversation ? (
            /* Liste des conversations - Mobile */
            <div className="h-full bg-white">
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                loading={loading}
                onSelectConversation={handleSelectConversation}
                onArchiveConversation={handleArchiveConversation}
                onNewConversation={() => setShowContactModal(true)}
                getOtherUserName={getOtherUserName}
                getOtherUserAvatar={getOtherUserAvatar}
                formatDate={formatDate}
                isMobile={true}
              />
            </div>
          ) : (
            /* Chat - Mobile */
            <div className="h-full flex flex-col bg-gray-50">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUser.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <MessageBubble
                      msg={msg}
                      isOwnMessage={msg.sender_id === currentUser.id}
                      expandedMessages={expandedMessages}
                      onToggleExpansion={toggleMessageExpansion}
                      formatDate={formatDate}
                    />
                  </div>
                ))}
                <TypingIndicator
                  typingUsers={typingUsers}
                  currentUserId={currentUser.id}
                />
              </div>

              {/* Zone de saisie - Mobile */}
              <MobileInput
                message={message}
                setMessage={setMessage}
                sending={sending}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onStopTyping={() => {
                  if (selectedConversation && isTyping) {
                    setIsTyping(false);
                    messagingSocket.stopTyping(selectedConversation.id);
                  }
                }}
                isTyping={isTyping}
                selectedConversation={selectedConversation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header Desktop */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                Messagerie
              </h1>
              <button
                onClick={() => setShowContactModal(true)}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>

          {/* Liste des conversations - Desktop */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              loading={loading}
              onSelectConversation={handleSelectConversation}
              onArchiveConversation={handleArchiveConversation}
              onNewConversation={() => setShowContactModal(true)}
              getOtherUserName={getOtherUserName}
              getOtherUserAvatar={getOtherUserAvatar}
              formatDate={formatDate}
              isMobile={false}
            />
          </div>
        </div>

        {/* Zone de chat - Desktop */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <ChatArea
            selectedConversation={selectedConversation}
            messages={messages}
            message={message}
            setMessage={setMessage}
            sending={sending}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onStopTyping={() => {
              if (selectedConversation && isTyping) {
                setIsTyping(false);
                messagingSocket.stopTyping(selectedConversation.id);
              }
            }}
            isTyping={isTyping}
            typingUsers={typingUsers}
            currentUser={currentUser}
            expandedMessages={expandedMessages}
            onToggleExpansion={toggleMessageExpansion}
            getOtherUserName={getOtherUserName}
            getOtherUserAvatar={getOtherUserAvatar}
            formatDate={formatDate}
            refreshingConversation={refreshingConversation}
            isMobile={false}
          />
        </div>
      </div>

      {/* Modal de sélection de contact */}
      <ContactSelectionModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onContactSelect={handleContactSelect}
      />
    </div>
  );
};

export default Messagerie;
