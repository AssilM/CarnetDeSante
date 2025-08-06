import React from "react";
import { FaUser, FaPlus } from "react-icons/fa";

const MobileHeader = ({
  selectedConversation,
  onBack,
  onNewConversation,
  getOtherUserName,
  getOtherUserAvatar,
  refreshingConversation,
}) => {
  if (!selectedConversation) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Messagerie</h1>
          <button
            onClick={onNewConversation}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="text-sm" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
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
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
