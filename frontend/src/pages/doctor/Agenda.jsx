import React from "react";
import PageWrapper from "../../components/PageWrapper";
import { useDoctorAppointmentContext } from "../../context";
import {
  AgendaNavigation,
  DayView,
  WeekView,
  MonthView,
  AppointmentModals,
} from "../../components/doctor/agenda";
import { useAppointmentActions } from "../../hooks/useAppointmentActions";
import { useAgendaNavigation } from "../../hooks/useAgendaNavigation";
import { useAppointmentModals } from "../../hooks/useAppointmentModals";
import {
  formatDateYMD,
  formatDateFr,
  formatDateTimeFr,
  getWeekDates,
  getMonthDates,
} from "../../utils/date.utils";

const Agenda = () => {
  const { appointments, error } = useDoctorAppointmentContext();
  const {
    handleCancel,
    handleStartAppointment,
    handleFinishAppointment,
    cancelLoading,
    actionLoading,
  } = useAppointmentActions();

  const {
    currentDate,
    viewMode,
    showCalendar,
    expandedDays,
    setViewMode,
    navigateDate,
    handleDateChange,
    toggleCalendar,
    toggleDayExpansion,
  } = useAgendaNavigation();

  const {
    selectedAppointment,
    showDetail,
    selectedDate,
    showDayDetail,
    handleShowDetail,
    handleCloseDetail,
    handleShowDayDetail,
    handleCloseDayDetail,
  } = useAppointmentModals();

  const getDayAppointments = (date) => {
    const dateStr = formatDateYMD(date);
    return appointments.filter(
      (apt) => apt.dateOnly === dateStr && apt.status !== "annulé"
    );
  };

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(currentDate);

  const renderCurrentView = () => {
    switch (viewMode) {
      case "day":
        return (
          <DayView
            currentDate={currentDate}
            getDayAppointments={getDayAppointments}
            handleShowDetail={handleShowDetail}
          />
        );
      case "week":
        return (
          <WeekView
            weekDates={weekDates}
            getDayAppointments={getDayAppointments}
            handleShowDetail={handleShowDetail}
            formatDateYMD={formatDateYMD}
            expandedDays={expandedDays}
            toggleDayExpansion={toggleDayExpansion}
          />
        );
      case "month":
        return (
          <MonthView
            monthDates={monthDates}
            currentDate={currentDate}
            getDayAppointments={getDayAppointments}
            handleShowDayDetail={handleShowDayDetail}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageWrapper className="bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-4 md:space-y-8">
        {/* Contrôles de navigation */}
        <AgendaNavigation
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentDate={currentDate}
          weekDates={weekDates}
          navigateDate={navigateDate}
          showCalendar={showCalendar}
          toggleCalendar={toggleCalendar}
          handleDateChange={handleDateChange}
          formatDateFr={formatDateFr}
        />

        {/* Vue principale selon le mode */}
        {renderCurrentView()}

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-[#DC3545] bg-opacity-10 border border-[#DC3545] border-opacity-20 rounded-xl p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-[#DC3545]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-[#DC3545]">
                  Erreur de connexion
                </h3>
                <div className="mt-2 text-[#DC3545] opacity-80">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals de rendez-vous */}
        <AppointmentModals
          showDetail={showDetail}
          selectedAppointment={selectedAppointment}
          handleCloseDetail={handleCloseDetail}
          formatDateTimeFr={formatDateTimeFr}
          handleCancel={handleCancel}
          cancelLoading={cancelLoading}
          showDayDetail={showDayDetail}
          selectedDate={selectedDate}
          handleCloseDayDetail={handleCloseDayDetail}
          getDayAppointments={getDayAppointments}
          formatDateFr={formatDateFr}
          handleShowDetail={handleShowDetail}
          handleStartAppointment={handleStartAppointment}
          handleFinishAppointment={handleFinishAppointment}
          actionLoading={actionLoading}
        />
      </div>

      {/* Overlay pour fermer le calendrier */}
      {showCalendar && (
        <div className="fixed inset-0 z-40" onClick={toggleCalendar}></div>
      )}
    </PageWrapper>
  );
};

export default Agenda;
