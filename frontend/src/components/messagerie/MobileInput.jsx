import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const MobileInput = ({
  message,
  setMessage,
  sending,
  onSendMessage,
  onTyping,
  onStopTyping,
  isTyping,
  selectedConversation,
}) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex space-x-3">
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
          placeholder="Message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={sending}
        />
        <button
          onClick={onSendMessage}
          disabled={!message.trim() || sending}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaPaperPlane className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default MobileInput;
