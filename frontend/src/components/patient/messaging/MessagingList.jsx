import React, { useState, useEffect } from 'react';
import { MessageCircle, User, UserCheck } from 'lucide-react';
import messagingService from '../../../services/api/messagingService';
import { useAuth } from '../../../context/AuthContext';
import UserPhoto from '../../common/UserPhoto';

const MessagingList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser: user, refreshUser } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        console.log("[MessagingList] Pas d'utilisateur - tentative de refresh");
        try {
          await refreshUser();
        } catch (error) {
          console.log("[MessagingList] Impossible de rafraîchir l'utilisateur:", error);
          setError('Erreur d\'authentification');
          setConversations([]);
          setIsLoading(false);
          return;
        }
      }

      try {
        setIsLoading(true);
        setError(null);
        const conversationsData = await messagingService.getUserConversations();
        
        // S'assurer que conversations est toujours un tableau
        const conversationsArray = Array.isArray(conversationsData) ? conversationsData : [];
        setConversations(conversationsArray);
        
        console.log("[MessagingList] Conversations chargées:", conversationsArray.length);
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        
        // Si c'est une erreur d'authentification, essayer de rafraîchir l'utilisateur
        if (error.response?.status === 401) {
          console.log("[MessagingList] Erreur 401 - tentative de refresh utilisateur");
          try {
            await refreshUser();
            // Retenter le chargement des conversations
            const conversationsData = await messagingService.getUserConversations();
            const conversationsArray = Array.isArray(conversationsData) ? conversationsData : [];
            setConversations(conversationsArray);
            setError(null);
          } catch (refreshError) {
            console.error("[MessagingList] Échec du refresh:", refreshError);
            setError('Erreur lors du chargement des conversations');
            setConversations([]);
          }
        } else {
          setError('Erreur lors du chargement des conversations');
          setConversations([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user, refreshUser]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRecipientName = (conversation) => {
    if (user?.role === 'patient') {
      return `${conversation.medecin_prenom} ${conversation.medecin_nom}`;
    } else {
      return `${conversation.patient_prenom} ${conversation.patient_nom}`;
    }
  };

  const getRecipientRole = (conversation) => {
    return user?.role === 'patient' ? 'médecin' : 'patient';
  };

  const getRecipientUser = (conversation) => {
    if (user?.role === 'patient') {
      // Pour un patient, retourner les infos du médecin
      return {
        prenom: conversation.medecin_prenom,
        nom: conversation.medecin_nom,
        chemin_photo: conversation.medecin_photo,
        role: 'medecin'
      };
    } else {
      // Pour un médecin, retourner les infos du patient
      return {
        prenom: conversation.patient_prenom,
        nom: conversation.patient_nom,
        chemin_photo: conversation.patient_photo,
        role: 'patient'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!Array.isArray(conversations) || conversations.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune conversation</p>
          <p className="text-sm">Prenez un rendez-vous pour commencer à discuter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const recipientName = getRecipientName(conversation);
        const recipientRole = getRecipientRole(conversation);
        const recipientUser = getRecipientUser(conversation);
        const isSelected = selectedConversationId === conversation.id;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-50 border-blue-200 border'
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <UserPhoto
                user={recipientUser}
                size="sm"
                className="flex-shrink-0"
                fallbackIcon={
                  user?.role === 'patient' ? (
                    <UserCheck className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )
                }
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {recipientName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.updated_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {recipientRole}
                </p>
                {conversation.date_rdv && (
                  <p className="text-xs text-gray-400">
                    RDV: {formatDate(conversation.date_rdv)} à {conversation.heure_rdv}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagingList; 