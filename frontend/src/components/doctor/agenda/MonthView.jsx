import React from "react";

const MonthView = ({
  monthDates,
  currentDate,
  getDayAppointments,
  handleShowDayDetail,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden">
      {/* Version desktop */}
      <div className="hidden md:block">
        {/* En-têtes des jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-[#E9ECEF] bg-[#F8F9FA]">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-[#6C757D] text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7">
          {monthDates.map((date, index) => {
            const dayAppointments = getDayAppointments(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-[#E9ECEF] last:border-r-0 p-2 hover:bg-[#F8F9FA] transition-colors ${
                  !isCurrentMonth ? "bg-gray-50" : "bg-white"
                }`}
              >
                {/* Numéro du jour */}
                <div className="flex justify-between items-start mb-2">
                  <div
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isCurrentMonth ? "text-[#343A40]" : "text-[#ADB5BD]"
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Indicateur du nombre de RDV */}
                  {dayAppointments.length > 0 && (
                    <div className="bg-[#4A90E2] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {dayAppointments.length}
                    </div>
                  )}
                </div>

                {/* Affichage du nombre de RDV */}
                {dayAppointments.length > 0 && (
                  <div
                    className="mt-2 cursor-pointer hover:bg-[#4A90E2] hover:text-white transition-colors rounded-md p-2 text-center bg-[#E8F4FD] text-[#4A90E2] text-sm font-medium"
                    onClick={() => handleShowDayDetail(date)}
                  >
                    {dayAppointments.length} RDV
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Version mobile - grille 7 colonnes compacte */}
      <div className="md:hidden">
        {/* En-têtes des jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-[#E9ECEF] bg-[#F8F9FA]">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, idx) => (
            <div
              key={idx}
              className="p-2 text-center font-semibold text-[#6C757D] text-xs"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier mobile */}
        <div className="grid grid-cols-7">
          {monthDates.map((date, index) => {
            const dayAppointments = getDayAppointments(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();

            return (
              <div
                key={index}
                className={`min-h-[70px] border-r border-b border-[#E9ECEF] last:border-r-0 p-1 transition-colors ${
                  !isCurrentMonth
                    ? "bg-gray-50"
                    : dayAppointments.length > 0
                    ? "bg-white hover:bg-[#E8F4FD] cursor-pointer"
                    : "bg-white"
                }`}
                onClick={() =>
                  dayAppointments.length > 0 && handleShowDayDetail(date)
                }
              >
                {/* Numéro du jour */}
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <div
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isCurrentMonth ? "text-[#343A40]" : "text-[#ADB5BD]"
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Indicateur du nombre de RDV - plus explicite */}
                  {dayAppointments.length > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="bg-[#4A90E2] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {dayAppointments.length}
                      </div>
                      <div className="text-xs text-[#4A90E2] font-medium mt-0.5">
                        RDV
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
