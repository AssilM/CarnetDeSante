import React from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import { useAppContext } from "../context/AppContext";

const Notification = () => {
  const { notification, closeNotification } = useAppContext();

  if (!notification) return null;

  const { type, message, autoClose } = notification;

  const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const borderColor =
    type === "success" ? "border-green-400" : "border-red-400";
  const Icon = type === "success" ? FiCheckCircle : FiAlertCircle;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <div
        className={`${bgColor} ${textColor} border-l-4 ${borderColor} p-4 shadow-lg rounded-md flex items-start justify-between`}
        role="alert"
      >
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
          <span className="font-medium">{message}</span>
        </div>

        {!autoClose && (
          <button
            onClick={closeNotification}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
