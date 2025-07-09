import React from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SelectedDateAppointments = ({
  selectedDateAppointments,
  selectedDate,
  today,
  currentDate,
  formatHeaderDate,
  selectedPage,
  setSelectedPage,
  pageSize = 3,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E9ECEF] p-6 transition-all duration-200 hover:shadow-md">
      <h3 className="text-lg font-semibold text-[#343A40] mb-4 flex items-center">
        <FaCalendarAlt className="mr-2 text-[#4A90E2]" />
        {selectedDate === today
          ? "Rendez-vous d'aujourd'hui"
          : `Rendez-vous du ${formatHeaderDate(currentDate)}`}
      </h3>

      {selectedDateAppointments.length === 0 ? (
        <div className="text-center py-8 text-[#6C757D]">
          <FaCalendarAlt className="mx-auto text-3xl text-[#E9ECEF] mb-3" />
          <p className="text-sm">
            Aucun rendez-vous{" "}
            {selectedDate === today ? "aujourd'hui" : "ce jour-là"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedDateAppointments
            .slice(selectedPage * pageSize, (selectedPage + 1) * pageSize)
            .map((appointment) => (
              <div
                key={appointment.id}
                className="border border-[#E9ECEF] rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start">
                  <div className="flex items-center justify-center bg-[#4A90E2] text-white rounded-lg px-3 py-2 mr-4 font-medium text-sm min-w-[60px] min-h-[36px]">
                    {appointment.time}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#343A40] mb-1">
                      {appointment.patient.name}
                    </div>
                    <div className="text-sm text-[#6C757D]">
                      {appointment.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {/* Pagination */}
          {selectedDateAppointments.length > pageSize && (
            <div className="flex justify-center items-center space-x-6 pt-2">
              <button
                onClick={() => setSelectedPage((p) => Math.max(0, p - 1))}
                disabled={selectedPage === 0}
                className="p-2 rounded-full border border-[#E9ECEF] text-[#4A90E2] disabled:opacity-40 hover:bg-[#E8F4FD] transition"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() =>
                  setSelectedPage((p) =>
                    (p + 1) * pageSize < selectedDateAppointments.length
                      ? p + 1
                      : p
                  )
                }
                disabled={
                  (selectedPage + 1) * pageSize >=
                  selectedDateAppointments.length
                }
                className="p-2 rounded-full border border-[#E9ECEF] text-[#4A90E2] disabled:opacity-40 hover:bg-[#E8F4FD] transition"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectedDateAppointments;
