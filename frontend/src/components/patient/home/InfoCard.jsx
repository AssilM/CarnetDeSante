import React from "react";

const InfoCard = ({ title, icon, message, messageColor = "text-gray-600" }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-40 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-base font-medium text-center">{title}</h3>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className={`text-sm ${messageColor} text-center`}>{message}</p>
      </div>
    </div>
  );
};

export default InfoCard;
