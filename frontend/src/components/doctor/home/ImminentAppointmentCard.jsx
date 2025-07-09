import React from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

const ImminentAppointmentCard = ({
  imminentAppointment,
  onShowDetail,
  formatDateTimeFr,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E9ECEF] p-6 transition-all duration-200 hover:shadow-md">
      <div className="border-b border-[#E9ECEF] pb-4 mb-4">
        <h2 className="text-xl font-semibold text-[#343A40] flex items-center">
          <FaClock className="mr-3 text-[#4A90E2]" /> Rendez-vous imminent
        </h2>
      </div>

      {!imminentAppointment ? (
        <div className="text-center py-8 text-[#6C757D]">
          <FaCalendarAlt className="mx-auto text-3xl text-[#E9ECEF] mb-3" />
          <p className="text-sm">Aucun rendez-vous imminent</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div className="bg-[#4A90E2] text-white rounded-full h-12 w-12 flex items-center justify-center mr-4 text-lg font-semibold">
              {imminentAppointment.time}
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#343A40]">
                {imminentAppointment.patient.name}
              </h3>
              <p className="text-sm text-[#6C757D]">
                {imminentAppointment.title}
              </p>
              <p className="text-sm text-[#6C757D]">
                {formatDateTimeFr(
                  imminentAppointment.dateRaw,
                  imminentAppointment.time
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => onShowDetail(imminentAppointment)}
            className="self-start sm:self-auto px-4 py-2 bg-[#4A90E2] text-white rounded-lg text-sm font-medium hover:bg-[#2E5BBA] transition-colors"
          >
            Gérer
          </button>
        </div>
      )}
    </div>
  );
};

export default ImminentAppointmentCard;
