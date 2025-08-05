import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, User, UserCheck, Calendar, Clock } from 'lucide-react';
import messagingService from '../../../services/api/messagingService';
import { useAuth } from '../../../context/AuthContext';
import UserPhoto from '../../common/UserPhoto';

const MessagingList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser: user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const fetchConversations = async () => {
        try {
          setIsLoading(true);
          const response = await messagingService.getUserConversations();
          
          // S'assurer que conversations est toujours un tableau
          let conversationsData = [];
          
          if (response && response.data) {
            conversationsData = Array.isArray(response.data) ? response.data : [];
          }
          
          setConversations(conversationsData);
          setError(null); // Effacer les erreurs précédentes
        } catch (error) {
          console.error('Erreur lors du chargement des conversations:', error);
          setConversations([]);
          
          // Gestion spécifique des erreurs d'authentification
          if (error.response?.status === 401) {
            setError('Session expirée. Veuillez vous reconnecter.');
          } else if (error.response?.status === 500) {
            setError('Erreur serveur. Veuillez réessayer plus tard.');
          } else {
            setError('Erreur lors du chargement des conversations');
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchConversations();
    }
  }, [user?.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const getRendezVousInfo = (conversation) => {
    if (!conversation.date_rdv) return null;
    
    const date = new Date(conversation.date_rdv);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: conversation.heure_rdv,
      status: conversation.rdv_statut
    };
  };

  const getRecipientUser = (conversation) => {
    return {
      prenom: conversation.patient_prenom,
      nom: conversation.patient_nom,
      chemin_photo: conversation.patient_photo,
      role: 'patient'
    };
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-500 mt-2">Chargement de l'utilisateur...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Aucune conversation pour le moment</p>
        <p className="text-sm">Les conversations apparaîtront ici quand vous aurez des rendez-vous</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.isArray(conversations) && conversations.map((conversation) => {
        const recipientName = `${conversation.patient_prenom} ${conversation.patient_nom}`;
        const recipientUser = getRecipientUser(conversation);
        const rendezVous = getRendezVousInfo(conversation);
        const isSelected = selectedConversationId === conversation.id;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg ${
              isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <UserPhoto
                user={recipientUser}
                size="sm"
                className="flex-shrink-0"
                fallbackIcon={<User className="w-5 h-5 text-white" />}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {recipientName}
                  </h3>
                  {conversation.last_message_time && (
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.last_message_time)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mb-1">
                  Patient
                </p>
                
                {rendezVous && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{rendezVous.date}</span>
                    {rendezVous.time && (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>{rendezVous.time}</span>
                      </>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rendezVous.status === 'confirme' ? 'bg-green-100 text-green-800' :
                      rendezVous.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rendezVous.status}
                    </span>
                  </div>
                )}
                
                {conversation.last_message && (
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message}
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