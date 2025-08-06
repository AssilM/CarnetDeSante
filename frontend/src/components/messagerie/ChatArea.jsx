import React from "react";
import { FaUser, FaPaperPlane, FaComments } from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const ChatArea = ({
  selectedConversation,
  messages,
  message,
  setMessage,
  sending,
  onSendMessage,
  onTyping,
  onStopTyping,
  isTyping,
  typingUsers,
  currentUser,
  expandedMessages,
  onToggleExpansion,
  getOtherUserName,
  getOtherUserAvatar,
  formatDate,
  refreshingConversation,
  isMobile = false,
}) => {
  if (!selectedConversation) {
    return (
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
    );
  }

  return (
    <>
      {/* Header du chat */}
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
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === currentUser.id ? "justify-end" : "justify-start"
            }`}
          >
            <MessageBubble
              msg={msg}
              isOwnMessage={msg.sender_id === currentUser.id}
              expandedMessages={expandedMessages}
              onToggleExpansion={onToggleExpansion}
              formatDate={formatDate}
            />
          </div>
        ))}
        <TypingIndicator
          typingUsers={typingUsers}
          currentUserId={currentUser.id}
        />
      </div>

      {/* Zone de saisie */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            onBlur={() => {
              if (selectedConversation && isTyping) {
                onStopTyping();
              }
            }}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          <button
            onClick={onSendMessage}
            disabled={!message.trim() || sending}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatArea;
