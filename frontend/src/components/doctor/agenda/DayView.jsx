import React from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

const DayView = ({ currentDate, getDayAppointments, handleShowDetail }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmé":
        return <FaCheckCircle className="text-green-500" />;
      case "annulé":
        return <FaTimesCircle className="text-red-500" />;
      case "en_attente":
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmé":
        return "bg-green-100 text-green-800 border-green-200";
      case "annulé":
        return "bg-red-100 text-red-800 border-red-200";
      case "en_attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden">
      {/* En-tête du jour */}
      <div className="bg-[#F8F9FA] border-b border-[#E9ECEF] p-4 md:p-6">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-semibold text-[#343A40] mb-2">
            {currentDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <p className="text-sm text-[#6C757D]">
            {getDayAppointments(currentDate).length} rendez-vous programmés
          </p>
        </div>
      </div>

      {/* Planning par créneaux - Design liste simple */}
      <div className="divide-y divide-[#E9ECEF]">
        {Array.from({ length: 11 }, (_, i) => {
          const hour = 8 + i;
          const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
          const nextTimeSlot = `${(hour + 1).toString().padStart(2, "0")}:00`;

          // Trouver tous les RDV de ce créneau horaire
          const slotAppointments = getDayAppointments(currentDate).filter(
            (apt) => {
              const [aptHour] = apt.time.split(":").map(Number);
              return aptHour === hour;
            }
          );

          return (
            <div
              key={hour}
              className="flex min-h-[80px] hover:bg-[#F8F9FA] transition-colors"
            >
              {/* Colonne heure */}
              <div className="w-20 md:w-24 flex-shrink-0 bg-[#F8F9FA] border-r border-[#E9ECEF] flex flex-col items-center justify-center p-2">
                <div className="text-sm font-semibold text-[#343A40]">
                  {timeSlot}
                </div>
                <div className="text-xs text-[#6C757D] hidden md:block">
                  {nextTimeSlot}
                </div>
              </div>

              {/* Colonne contenu */}
              <div className="flex-1 p-4 flex items-center">
                {slotAppointments.length === 0 ? (
                  /* Créneau libre */
                  <div className="w-full text-center py-6">
                    <div className="text-[#ADB5BD] text-sm">Créneau libre</div>
                  </div>
                ) : (
                  /* Rendez-vous */
                  <div className="w-full space-y-3">
                    {slotAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getStatusColor(
                          appointment.status
                        )} bg-white`}
                        onClick={() => handleShowDetail(appointment)}
                      >
                        <div className="p-4">
                          {/* En-tête du RDV */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-[#4A90E2] text-white text-sm font-bold px-3 py-1 rounded-lg">
                                {appointment.time}
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(appointment.status)}
                                <span className="text-sm font-medium text-[#6C757D] capitalize">
                                  {appointment.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-[#ADB5BD] hidden md:block">
                              Durée: 30min
                            </div>
                          </div>

                          {/* Informations patient */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-[#6C757D] mb-1">
                                Patient
                              </div>
                              <div className="text-lg font-semibold text-[#343A40]">
                                {appointment.patient.name}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-[#6C757D] mb-1">
                                Motif
                              </div>
                              <div className="text-sm text-[#343A40]">
                                {appointment.title}
                              </div>
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
        })}
      </div>
    </div>
  );
};

export default DayView;
