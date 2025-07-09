import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const AppointmentCalendar = ({ currentDate, onDateChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E9ECEF] p-6 transition-all duration-200 hover:shadow-md">
      <h3 className="text-lg font-semibold text-[#343A40] mb-4 flex items-center">
        <FaCalendarAlt className="mr-2 text-[#4A90E2]" />
        Calendrier
      </h3>

      <div className="custom-calendar-container">
        <Calendar
          onChange={onDateChange}
          value={currentDate}
          locale="fr-FR"
          maxDetail="month"
          minDetail="month"
          showNeighboringMonth={false}
          className="w-full max-w-full bg-white border-none font-sans leading-tight text-sm text-gray-700"
        />
      </div>
    </div>
  );
};

export default AppointmentCalendar;
