import { useState } from "react";

export const useAppointmentModals = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  const handleShowDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedAppointment(null);
  };

  const handleShowDayDetail = (date) => {
    setSelectedDate(date);
    setShowDayDetail(true);
  };

  const handleCloseDayDetail = () => {
    setShowDayDetail(false);
    setSelectedDate(null);
  };

  return {
    selectedAppointment,
    showDetail,
    selectedDate,
    showDayDetail,
    handleShowDetail,
    handleCloseDetail,
    handleShowDayDetail,
    handleCloseDayDetail,
  };
};
