import React from "react";

const TabButton = ({ id, title, active, onClick, icon }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {icon}
      <span>{title}</span>
    </button>
  );
};

export default TabButton;
