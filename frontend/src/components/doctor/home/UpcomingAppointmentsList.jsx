import React from "react";
import { FaCalendarAlt, FaClock, FaEye, FaUser } from "react-icons/fa";

const UpcomingAppointmentsList = ({
  upcomingAppointments,
  loading,
  onShowDetail,
  formatDateTimeFr,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E9ECEF] transition-all duration-200 hover:shadow-md">
      <div className="border-b border-[#E9ECEF] px-6 py-4">
        <h2 className="text-xl font-semibold text-[#343A40] flex items-center">
          <FaCalendarAlt className="mr-3 text-[#4A90E2]" /> Prochains
          rendez-vous
        </h2>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A90E2]"></div>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-12 text-[#6C757D]">
            <FaCalendarAlt className="mx-auto text-4xl text-[#E9ECEF] mb-4" />
            <p className="text-lg">Aucun rendez-vous à venir pour le moment</p>
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#4A90E2] scrollbar-track-[#E8F4FD] snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#E8F4FD] [&::-webkit-scrollbar-thumb]:bg-[#4A90E2] [&::-webkit-scrollbar-thumb]:rounded-full">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="min-w-[85vw] sm:min-w-[320px] max-w-xs bg-white border border-[#E9ECEF] p-6 rounded-lg flex-shrink-0 snap-center shadow-sm transition-all duration-200 hover:shadow-md hover:transform hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="bg-[#E8F4FD] rounded-full p-2 mr-3">
                        <FaUser className="text-[#4A90E2] text-sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-[#343A40]">
                          {appointment.patient.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="inline-block bg-[#E8F4FD] text-[#4A90E2] px-3 py-1 rounded-full text-xs font-medium">
                        {appointment.title}
                      </span>
                      <div className="flex items-center text-[#6C757D] text-sm">
                        <FaClock className="mr-2 text-[#4A90E2]" />
                        <span>
                          {formatDateTimeFr(
                            appointment.dateRaw,
                            appointment.time
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="flex items-center justify-center bg-[#4A90E2] text-white rounded-lg px-3 py-2 text-sm font-medium mb-4 min-w-[60px] min-h-[36px]">
                      {appointment.time}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-[#4A90E2] hover:text-[#2E5BBA] p-2 rounded-lg hover:bg-[#E8F4FD] transition-colors"
                        onClick={() => onShowDetail(appointment)}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointmentsList;
