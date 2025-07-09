import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const AgendaStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-[#6C757D] mb-1 md:mb-2">
              Aujourd'hui
            </p>
            <p className="text-xl md:text-3xl font-bold text-[#4A90E2]">
              {stats.today}
            </p>
          </div>
          <div className="bg-[#E8F4FD] rounded-full p-2 md:p-4">
            <FaClock className="text-[#4A90E2] text-lg md:text-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-[#6C757D] mb-1 md:mb-2">
              Total
            </p>
            <p className="text-xl md:text-3xl font-bold text-[#343A40]">
              {stats.total}
            </p>
          </div>
          <div className="bg-gray-100 rounded-full p-2 md:p-4">
            <FaCalendarAlt className="text-gray-600 text-lg md:text-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-[#6C757D] mb-1 md:mb-2">
              Confirmés
            </p>
            <p className="text-xl md:text-3xl font-bold text-green-600">
              {stats.confirmed}
            </p>
          </div>
          <div className="bg-green-100 rounded-full p-2 md:p-4">
            <FaCheckCircle className="text-green-600 text-lg md:text-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-[#6C757D] mb-1 md:mb-2">
              Annulés
            </p>
            <p className="text-xl md:text-3xl font-bold text-red-600">
              {stats.cancelled}
            </p>
          </div>
          <div className="bg-red-100 rounded-full p-2 md:p-4">
            <FaTimesCircle className="text-red-600 text-lg md:text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaStats;
