import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import MessagingList from '../../components/patient/messaging/MessagingList';
import ChatWindow from '../../components/patient/messaging/ChatWindow';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/PageWrapper';

const Messaging = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { currentUser: user } = useAuth();

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
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

  const recipientName = selectedConversation ? getRecipientName(selectedConversation) : '';
  const recipientRole = selectedConversation ? getRecipientRole(selectedConversation) : '';
  const recipientUser = selectedConversation ? getRecipientUser(selectedConversation) : null;

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messagerie</h1>
          <p className="text-gray-600">
            Communiquez avec vos médecins en toute sécurité
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
                <MessagingList
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              </div>
            </div>
          </div>

          {/* Fenêtre de chat */}
          <div className="lg:col-span-2">
            {selectedConversation && user ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                recipientName={recipientName}
                recipientRole={recipientRole}
                recipientUser={recipientUser}
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