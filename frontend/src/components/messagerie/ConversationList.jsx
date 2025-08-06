import React from "react";
import { FaUser, FaTrash, FaInbox } from "react-icons/fa";

const ConversationList = ({
  conversations,
  selectedConversation,
  loading,
  onSelectConversation,
  onArchiveConversation,
  onNewConversation,
  getOtherUserName,
  getOtherUserAvatar,
  formatDate,
  isMobile = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <FaInbox
          className={`${isMobile ? "text-6xl" : "text-5xl"} text-gray-300 mb-4`}
        />
        <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
          Aucune conversation
        </h3>
        <p className="text-gray-500 mb-6 text-center">
          Commencez par créer une nouvelle conversation
        </p>
        <button
          onClick={onNewConversation}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Créer une conversation
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
            selectedConversation?.id === conversation.id && !isMobile
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
                    onArchiveConversation(conversation.id);
                  }}
                  className={`p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 ${
                    isMobile ? "" : "opacity-0 group-hover:opacity-100"
                  }`}
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
  );
};

export default ConversationList;
