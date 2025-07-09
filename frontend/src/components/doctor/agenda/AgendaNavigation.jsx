import React from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdToday, MdViewWeek, MdViewDay } from "react-icons/md";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const AgendaNavigation = ({
  viewMode,
  setViewMode,
  currentDate,
  weekDates,
  navigateDate,
  showCalendar,
  toggleCalendar,
  handleDateChange,
  formatDateFr,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-4 md:p-6">
      {/* Version desktop */}
      <div className="hidden md:flex items-center justify-between">
        {/* Sélecteur de vue - gauche */}
        <div className="flex border border-[#E9ECEF] rounded-xl shadow-sm">
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              viewMode === "day"
                ? "bg-[#4A90E2] text-white"
                : "text-[#6C757D] hover:bg-[#E8F4FD]"
            } rounded-l-xl`}
          >
            <MdViewDay className="inline mr-2" />
            Jour
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              viewMode === "week"
                ? "bg-[#4A90E2] text-white"
                : "text-[#6C757D] hover:bg-[#E8F4FD]"
            }`}
          >
            <MdViewWeek className="inline mr-2" />
            Semaine
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              viewMode === "month"
                ? "bg-[#4A90E2] text-white"
                : "text-[#6C757D] hover:bg-[#E8F4FD]"
            } rounded-r-xl`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Mois
          </button>
        </div>

        {/* Navigation de date - centre */}
        <div className="flex items-center border border-[#E9ECEF] rounded-xl shadow-sm">
          <button
            onClick={() => navigateDate(-1)}
            className="p-3 hover:bg-[#E8F4FD] transition-colors rounded-l-xl"
          >
            <FaChevronLeft className="text-lg" />
          </button>

          {/* Sélecteur de date cliquable avec calendrier */}
          <div className="relative">
            <button
              onClick={toggleCalendar}
              className="px-6 py-3 font-medium text-[#343A40] w-[300px] text-center hover:bg-[#E8F4FD] transition-colors flex items-center justify-center"
            >
              <FaCalendarAlt className="mr-2 text-[#4A90E2]" />
              {viewMode === "week"
                ? `${formatDateFr(weekDates[0])} - ${formatDateFr(
                    weekDates[6]
                  )}`
                : viewMode === "month"
                ? currentDate.toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })
                : formatDateFr(currentDate)}
            </button>

            {/* Calendrier popup */}
            {showCalendar && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white border border-[#E9ECEF] rounded-xl shadow-lg p-4 custom-calendar-container">
                <Calendar
                  onChange={handleDateChange}
                  value={currentDate}
                  locale="fr-FR"
                  maxDetail="month"
                  minDetail="month"
                  showNeighboringMonth={false}
                  className="w-full max-w-full bg-white border-none font-sans leading-tight text-sm text-gray-700"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => navigateDate(1)}
            className="p-3 hover:bg-[#E8F4FD] transition-colors rounded-r-xl"
          >
            <FaChevronRight className="text-lg" />
          </button>
        </div>

        {/* Espace vide à droite pour équilibrer */}
        <div className="w-[140px]"></div>
      </div>

      {/* Version mobile/tablette */}
      <div className="md:hidden space-y-4">
        {/* Sélecteur de vue en haut */}
        <div className="flex justify-center">
          <div className="flex border border-[#E9ECEF] rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-3 text-sm font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-[#4A90E2] text-white"
                  : "text-[#6C757D] hover:bg-[#E8F4FD]"
              } rounded-l-xl`}
            >
              <MdViewDay className="inline mr-1" />
              Jour
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-3 text-sm font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-[#4A90E2] text-white"
                  : "text-[#6C757D] hover:bg-[#E8F4FD]"
              }`}
            >
              <MdViewWeek className="inline mr-1" />
              Semaine
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-3 text-sm font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-[#4A90E2] text-white"
                  : "text-[#6C757D] hover:bg-[#E8F4FD]"
              } rounded-r-xl`}
            >
              <FaCalendarAlt className="inline mr-1" />
              Mois
            </button>
          </div>
        </div>

        {/* Navigation de date en bas */}
        <div className="flex justify-center">
          <div className="flex items-center border border-[#E9ECEF] rounded-xl shadow-sm">
            <button
              onClick={() => navigateDate(-1)}
              className="p-3 hover:bg-[#E8F4FD] transition-colors rounded-l-xl"
            >
              <FaChevronLeft className="text-lg" />
            </button>

            {/* Sélecteur de date cliquable avec calendrier */}
            <div className="relative">
              <button
                onClick={toggleCalendar}
                className="px-4 py-3 font-medium text-[#343A40] text-center hover:bg-[#E8F4FD] transition-colors flex items-center justify-center min-w-[250px]"
              >
                <FaCalendarAlt className="mr-2 text-[#4A90E2]" />
                <span className="text-sm">
                  {viewMode === "week"
                    ? `${formatDateFr(weekDates[0])} - ${formatDateFr(
                        weekDates[6]
                      )}`
                    : viewMode === "month"
                    ? currentDate.toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                      })
                    : formatDateFr(currentDate)}
                </span>
              </button>

              {/* Calendrier popup */}
              {showCalendar && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white border border-[#E9ECEF] rounded-xl shadow-lg p-4 custom-calendar-container">
                  <Calendar
                    onChange={handleDateChange}
                    value={currentDate}
                    locale="fr-FR"
                    maxDetail="month"
                    minDetail="month"
                    showNeighboringMonth={false}
                    className="w-full max-w-full bg-white border-none font-sans leading-tight text-sm text-gray-700"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => navigateDate(1)}
              className="p-3 hover:bg-[#E8F4FD] transition-colors rounded-r-xl"
            >
              <FaChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaNavigation;
