import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { createMessagingService } from "../../services/api";
import { httpService } from "../../services";
import messagingSocket from "../../services/websocket/messagingSocket";
import ContactSelectionModal from "../../components/messagerie/ContactSelectionModal";
import {
  FaSearch,
  FaUserMd,
  FaUser,
  FaPlus,
  FaPaperPlane,
  FaComments,
  FaInbox,
  FaTrash,
} from "react-icons/fa";

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

  // Afficher l'erreur si elle existe
  useEffect(() => {
    if (error) {
      console.error("Erreur messagerie:", error);
      // Ici on pourrait afficher une notification d'erreur
    }
  }, [error]);

  // Initialiser la connexion WebSocket
  useEffect(() => {
    if (currentUser) {
      console.log("👤 Utilisateur connecté:", currentUser);
      messagingSocket.connect();

      // Écouter les événements WebSocket
      messagingSocket.on("new_message", handleNewMessage);
      messagingSocket.on("error", handleSocketError);
      messagingSocket.on("connect", () => {
        console.log("✅ WebSocket connecté - mise à jour de l'état");
        setSocketConnected(true);

        // Rejoindre les rooms après la connexion WebSocket
        if (conversations.length > 0) {
          conversations.forEach((conversation) => {
            messagingSocket.joinRoom(conversation.id);
          });
        }
      });
      messagingSocket.on("disconnect", () => {
        console.log("❌ WebSocket déconnecté - mise à jour de l'état");
        setSocketConnected(false);
      });

      return () => {
        messagingSocket.off("new_message", handleNewMessage);
        messagingSocket.off("error", handleSocketError);
        messagingSocket.off("connect");
        messagingSocket.off("disconnect");
      };
    }
  }, [currentUser, conversations]);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  // Gérer les nouveaux messages
  const handleNewMessage = (messageData) => {
    console.log("📨 Nouveau message reçu via WebSocket:", messageData);

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

  // Gérer les erreurs WebSocket
  const handleSocketError = (error) => {
    console.error("Erreur WebSocket:", error);
    setSocketConnected(false);
  };

  // Charger les conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getConversations();
      setConversations(response.conversations || []);

      // Rejoindre automatiquement toutes les rooms des conversations seulement si WebSocket est connecté
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

      // Rejoindre la room WebSocket
      messagingSocket.joinRoom(conversationId);

      // Marquer les messages comme lus via WebSocket
      messagingSocket.markAsRead(conversationId);
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

      // Envoyer via WebSocket (le serveur WebSocket gère la création en base)
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

  return (
    <div
      className={`h-full bg-gray-50 transition-all duration-300 ${
        isSidebarExpanded ? "md:pl-72" : "md:pl-20"
      }`}
    >
      {/* Mobile Layout */}
      <div className="h-full flex flex-col md:hidden">
        {/* Header Mobile */}
        {!selectedConversation ? (
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
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
        ) : (
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {getOtherUserAvatar(selectedConversation) ? (
                <img
                  src={getOtherUserAvatar(selectedConversation)}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-600 text-sm" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-medium text-gray-900">
                  {refreshingConversation
                    ? "Chargement..."
                    : getOtherUserName(selectedConversation)}
                </h2>
                <p className="text-xs text-gray-500">
                  {socketConnected ? "En ligne" : "Hors ligne"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Mobile */}
        <div className="flex-1 overflow-hidden">
          {!selectedConversation ? (
            /* Liste des conversations - Mobile */
            <div className="h-full bg-white">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <FaInbox className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                    Aucune conversation
                  </h3>
                  <p className="text-gray-500 mb-6 text-center">
                    Commencez par créer une nouvelle conversation
                  </p>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Créer une conversation
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                        {getOtherUserAvatar(conversation) ? (
                          <img
                            src={getOtherUserAvatar(conversation)}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-600" />
                          </div>
                        )}
                        {conversation.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>

                      {/* Informations */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getOtherUserName(conversation)}
                          </p>
                          <div className="flex items-center space-x-2">
                            {conversation.updated_at && (
                              <p className="text-xs text-gray-400">
                                {formatDate(conversation.updated_at)}
                              </p>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveConversation(conversation.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                              title="Fermer la conversation"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {conversation.last_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        msg.sender_id === currentUser.id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_id === currentUser.id
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {formatDate(msg.sent_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de saisie - Mobile */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <FaInbox className="text-5xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                  Aucune conversation
                </h3>
                <p className="text-gray-500 mb-6 text-center">
                  Commencez par créer une nouvelle conversation
                </p>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Créer une conversation
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                      selectedConversation?.id === conversation.id
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      {getOtherUserAvatar(conversation) ? (
                        <img
                          src={getOtherUserAvatar(conversation)}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-600" />
                        </div>
                      )}
                      {conversation.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getOtherUserName(conversation)}
                        </p>
                        <div className="flex items-center space-x-2">
                          {conversation.updated_at && (
                            <p className="text-xs text-gray-400">
                              {formatDate(conversation.updated_at)}
                            </p>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveConversation(conversation.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                            title="Fermer la conversation"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                      {conversation.last_message && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {conversation.last_message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat - Desktop */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Header du chat - Desktop */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  {getOtherUserAvatar(selectedConversation) ? (
                    <img
                      src={getOtherUserAvatar(selectedConversation)}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {refreshingConversation
                        ? "Chargement..."
                        : getOtherUserName(selectedConversation)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {socketConnected ? "En ligne" : "Hors ligne"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages - Desktop */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUser.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${
                        msg.sender_id === currentUser.id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_id === currentUser.id
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {formatDate(msg.sent_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de saisie - Desktop */}
              <div className="bg-white border-t border-gray-200 p-6">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500">
                  Choisissez une conversation pour commencer à discuter
                </p>
              </div>
            </div>
          )}
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
