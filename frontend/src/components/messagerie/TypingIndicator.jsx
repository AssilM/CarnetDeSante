import React from "react";

const TypingIndicator = ({ typingUsers, currentUserId }) => {
  const otherUserTyping = Array.from(typingUsers).some(
    (userId) => userId !== currentUserId
  );

  if (!otherUserTyping) return null;

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
