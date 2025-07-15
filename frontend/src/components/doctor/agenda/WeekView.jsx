import React from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaChevronRight,
  FaSpinner,
  FaCheck,
} from "react-icons/fa";

const HOURS = Array.from({ length: 21 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

const WeekView = ({
  weekDates,
  getDayAppointments,
  handleShowDetail,
  formatDateYMD,
  expandedDays,
  toggleDayExpansion,
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmé":
        return <FaCheckCircle className="text-green-500" />;
      case "annulé":
        return <FaTimesCircle className="text-red-500" />;
      case "en_attente":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "en_cours":
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case "terminé":
        return <FaCheck className="text-purple-500" />;
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
      case "en_cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "terminé":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden">
      {/* Version desktop : grille horaire */}
      <div className="hidden md:block">
        <div className="grid grid-cols-8 border-b border-[#E9ECEF]">
          {/* Colonne vide pour les heures */}
          <div className="bg-[#F8F9FA] border-r border-[#E9ECEF] p-4"></div>
          {weekDates.map((date, index) => {
            const isToday = formatDateYMD(date) === formatDateYMD(new Date());
            return (
              <div
                key={index}
                className="p-4 border-r border-[#E9ECEF] last:border-r-0 text-center"
              >
                <div
                  className={`mb-2 h-20 flex flex-col items-center justify-center ${
                    isToday ? "text-[#4A90E2] font-bold" : "text-[#343A40]"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </div>
                  <div className="text-xs mb-1">
                    {date.toLocaleDateString("fr-FR", { month: "short" })}
                  </div>
                  <div
                    className={`text-lg ${
                      isToday
                        ? "bg-[#4A90E2] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                        : ""
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Grille horaire */}
        <div className="grid grid-cols-8">
          {/* Colonne des heures */}
          <div className="flex flex-col border-r border-[#E9ECEF] bg-[#F8F9FA]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-14 flex items-center justify-center text-xs font-semibold text-[#343A40] border-b border-[#E9ECEF]"
              >
                {hour}
              </div>
            ))}
          </div>
          {/* Colonnes jours */}
          {weekDates.map((date, dayIdx) => {
            const dayAppointments = getDayAppointments(date);
            return (
              <div key={dayIdx} className="flex flex-col">
                {HOURS.map((hour) => {
                  // RDV de ce créneau (heure exacte)
                  const slotAppointments = dayAppointments.filter(
                    (apt) => apt.time === hour
                  );
                  // Absence (optionnel) : motif ou statut contient "absence"
                  const absences = dayAppointments.filter(
                    (apt) =>
                      (apt.motif &&
                        apt.motif.toLowerCase().includes("absence")) ||
                      (apt.status &&
                        apt.status.toLowerCase().includes("absence"))
                  );
                  return (
                    <div
                      key={hour}
                      className="h-14 border-b border-[#E9ECEF] flex gap-1 px-1 items-center"
                    >
                      {/* Affichage des absences */}
                      {absences
                        .filter((a) => a.time === hour)
                        .map((absence) => (
                          <div
                            key={absence.id}
                            className="flex-1 bg-gray-200 text-gray-700 text-xs rounded px-2 py-1 border border-gray-300 font-semibold text-center"
                          >
                            Absence
                          </div>
                        ))}
                      {/* Affichage des rendez-vous */}
                      {slotAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => handleShowDetail(appointment)}
                          className={`flex-1 min-w-0 cursor-pointer rounded-lg border text-xs px-2 py-1 flex flex-col items-start justify-center hover:shadow-md transition-all ${getStatusColor(
                            appointment.status
                          )}`}
                          title={
                            appointment.patient.name + " - " + appointment.title
                          }
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-bold">
                              {appointment.patient.name}
                            </span>
                            {getStatusIcon(appointment.status)}
                          </div>
                          <div className="truncate w-full">
                            {appointment.title}
                          </div>
                        </div>
                      ))}
                      {/* Créneau libre */}
                      {slotAppointments.length === 0 &&
                        absences.filter((a) => a.time === hour).length ===
                          0 && (
                          <div className="flex-1 text-[#ADB5BD] text-xs text-center select-none">
                            {/* Vide */}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Version mobile - inchangée */}
      <div className="md:hidden">
        {weekDates.map((date, index) => {
          const dayAppointments = getDayAppointments(date);
          const isToday = formatDateYMD(date) === formatDateYMD(new Date());
          const dateStr = formatDateYMD(date);
          const isExpanded = expandedDays.has(dateStr);

          return (
            <div
              key={index}
              className="border-b border-[#E9ECEF] last:border-b-0"
            >
              <div
                className="p-4 bg-[#F8F9FA] cursor-pointer hover:bg-[#E8F4FD] transition-colors"
                onClick={() => toggleDayExpansion(dateStr)}
              >
                <div
                  className={`flex items-center justify-between ${
                    isToday ? "text-[#4A90E2] font-bold" : "text-[#343A40]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-[#4A90E2] text-white"
                          : "bg-white border border-[#E9ECEF]"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {date.toLocaleDateString("fr-FR", {
                          weekday: "long",
                        })}
                      </div>
                      <div className="text-xs text-[#6C757D]">
                        {date.toLocaleDateString("fr-FR", {
                          month: "long",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-[#6C757D]">
                      {dayAppointments.length} RDV
                    </div>
                    {dayAppointments.length > 0 && (
                      <div
                        className={`transform transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        <FaChevronRight className="text-[#6C757D]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section pliable des rendez-vous */}
              {dayAppointments.length > 0 && isExpanded && (
                <div className="p-4 space-y-3 bg-white">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowDetail(appointment);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {appointment.time}
                        </span>
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {appointment.patient.name}
                      </div>
                      <div className="text-sm text-[#6C757D] truncate">
                        {appointment.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
