import React from "react";
import { FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import { useAuth } from "../../../context";

const WelcomeSection = ({ currentDateTime }) => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-gradient-to-r from-[#E8F4FD] to-white rounded-lg relative overflow-hidden p-6 shadow-sm border border-[#E9ECEF] transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#343A40] mb-1">
            Bonjour, Dr. {currentUser?.nom} {currentUser?.prenom}
          </h1>
          <p className="text-[#6C757D] text-base mb-3">
            {currentUser?.specialite}
          </p>
          {/* Date & heure courantes */}
          <div className="flex items-center text-sm text-[#6C757D] space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-1 text-[#4A90E2]" />
              <span>
                {currentDateTime.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-1 text-[#4A90E2]" />
              <span>
                {currentDateTime.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-[#E8F4FD] rounded-full p-4 flex-shrink-0 relative z-10">
          <FaUser className="text-[#4A90E2] text-2xl" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
