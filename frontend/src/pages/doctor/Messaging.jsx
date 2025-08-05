import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { MessagingList, ChatWindow } from '../../components/doctor/messaging';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';
import { getCurrentToken } from '../../services/http';
import { MessageCircle } from 'lucide-react';

const Messaging = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientRole, setRecipientRole] = useState('');
  const { currentUser: user } = useAuth();

  useEffect(() => {
    // Connecter le socket si pas déjà connecté
    if (user && !socketService.isSocketConnected()) {
      const accessToken = getCurrentToken();
      if (accessToken) {
        socketService.connect(accessToken);
      }
    }

    // Ne pas déconnecter le socket lors du démontage
    // Le socket sera déconnecté lors de la déconnexion de l'utilisateur
  }, [user]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    // Déterminer le nom et le rôle du destinataire
    if (user.role === 'patient') {
      setRecipientName(`${conversation.medecin_prenom} ${conversation.medecin_nom}`);
      setRecipientRole('medecin');
    } else {
      setRecipientName(`${conversation.patient_prenom} ${conversation.patient_nom}`);
      setRecipientRole('patient');
    }
  };

  const getRecipientUser = (conversation) => {
    if (user.role === 'patient') {
      return {
        prenom: conversation.medecin_prenom,
        nom: conversation.medecin_nom,
        chemin_photo: conversation.medecin_photo,
        role: 'medecin'
      };
    } else {
      return {
        prenom: conversation.patient_prenom,
        nom: conversation.patient_nom,
        chemin_photo: conversation.patient_photo,
        role: 'patient'
      };
    }
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
    setRecipientName('');
    setRecipientRole('');
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <MessageCircle className="text-3xl text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Messagerie</h1>
              <p className="text-gray-600">
                Communiquez avec vos patients en temps réel
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conversations
                </h2>
              </div>
              
              <div className="p-4">
                {user ? (
                  <MessagingList
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Chargement...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone de chat */}
          <div className="lg:col-span-2">
            {selectedConversation && user ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                recipientName={recipientName}
                recipientRole={recipientRole}
                recipientUser={getRecipientUser(selectedConversation)}
                onClose={handleCloseChat}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
                  <p className="text-sm">
                    Choisissez une conversation dans la liste pour commencer à discuter
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Messaging; 