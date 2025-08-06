import React from "react";
import { FaCheck, FaCheckDouble } from "react-icons/fa";

const MessageBubble = ({
  msg,
  isOwnMessage,
  expandedMessages,
  onToggleExpansion,
  formatDate,
}) => {
  const isExpanded = expandedMessages.has(msg.id);
  const maxLength = 200; // Longueur maximale avant troncature
  const isLongMessage = msg.content.length > maxLength;
  const displayText = isExpanded
    ? msg.content
    : msg.content.substring(0, maxLength);
  const needsTruncation = isLongMessage && !isExpanded;

  // Déterminer le statut de lecture d'un message
  const getMessageStatus = (msg, isOwnMessage) => {
    if (!isOwnMessage) return null; // Seulement pour nos propres messages

    if (msg.is_read) {
      return { icon: FaCheckDouble, color: "text-blue-200", title: "Lu" };
    } else {
      return { icon: FaCheck, color: "text-gray-300", title: "Envoyé" };
    }
  };

  const messageStatus = getMessageStatus(msg, isOwnMessage);

  return (
    <div
      className={`max-w-[75%] md:max-w-md px-4 py-2 rounded-2xl ${
        isOwnMessage
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-900 shadow-sm"
      }`}
    >
      <div className="whitespace-pre-wrap break-words">
        {displayText}
        {needsTruncation && (
          <span
            className={`text-lg font-bold ${
              isOwnMessage ? "text-blue-200" : "text-gray-400"
            } ml-1`}
          >
            ...
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <p
            className={`text-xs ${
              isOwnMessage ? "text-blue-100" : "text-gray-400"
            }`}
          >
            {formatDate(msg.sent_at)}
          </p>
          {messageStatus && (
            <div
              className="flex items-center space-x-1"
              title={messageStatus.title}
            >
              <messageStatus.icon
                className={`text-xs ${messageStatus.color}`}
              />
            </div>
          )}
        </div>
        {isLongMessage && (
          <button
            onClick={() => onToggleExpansion(msg.id)}
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              isOwnMessage
                ? "bg-blue-400 text-white hover:bg-blue-300"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            } transition-colors shadow-sm`}
          >
            {isExpanded ? "Voir moins" : "Voir suite"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
