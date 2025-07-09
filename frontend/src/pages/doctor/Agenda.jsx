import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { useDoctorAppointmentContext } from "../../context";
import { useAppContext } from "../../context/AppContext";
import {
  AgendaHeader,
  AgendaStats,
  AgendaNavigation,
  DayView,
  WeekView,
  MonthView,
  AppointmentModals,
} from "../../components/doctor/agenda";

const Agenda = () => {
  const { appointments, error, cancelAppointment } =
    useDoctorAppointmentContext();
  const { showNotification } = useAppContext();

  // États pour la navigation et les filtres
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // "week", "month", "day"
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set());

  // Fonctions utilitaires pour les dates
  const formatDateYMD = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateFr = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Intl.DateTimeFormat("fr-FR", options).format(date);
    } catch (error) {
      console.error("Erreur formatage date:", error);
      return date.toLocaleDateString("fr-FR");
    }
  };

  const formatDateTimeFr = (dateStr, timeStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      let time = timeStr ? timeStr.substring(0, 5) : "";
      return `${day}/${month}/${year}${time ? " à " + time : ""}`;
    } catch (error) {
      console.error("Erreur formatage date/heure:", error);
      return dateStr || "";
    }
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);

    // Premier jour à afficher (début de semaine)
    const startDate = new Date(firstDay);
    const startDayOfWeek = firstDay.getDay();
    const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    // Générer 42 jours (6 semaines)
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate);
    }

    return dates;
  };

  const getDayAppointments = (date) => {
    const dateStr = formatDateYMD(date);
    return appointments.filter(
      (apt) => apt.dateOnly === dateStr && apt.status !== "annulé"
    );
  };

  // Statistiques
  const getStats = () => {
    const today = formatDateYMD(new Date());
    const todayAppointments = appointments.filter(
      (apt) => apt.dateOnly === today && apt.status !== "annulé"
    );
    const activeAppointments = appointments.filter(
      (apt) => apt.status !== "annulé"
    );
    const confirmedCount = appointments.filter(
      (apt) => apt.status === "confirmé"
    ).length;
    const cancelledCount = appointments.filter(
      (apt) => apt.status === "annulé"
    ).length;

    return {
      today: todayAppointments.length,
      total: activeAppointments.length,
      confirmed: confirmedCount,
      cancelled: cancelledCount,
    };
  };

  // Gestion des actions
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

  const toggleDayExpansion = (dateStr) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDays(newExpanded);
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    if (!window.confirm("Confirmer l'annulation de ce rendez-vous ?")) return;

    setCancelLoading(true);
    try {
      await cancelAppointment(selectedAppointment.id);
      setShowDetail(false);
      showNotification({
        type: "success",
        message: "Rendez-vous annulé avec succès !",
      });
    } catch {
      showNotification({
        type: "error",
        message: "Erreur lors de l'annulation du rendez-vous",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const stats = getStats();
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
        {/* Header avec titre centré */}
        <AgendaHeader />

        {/* Statistiques - responsive */}
        <AgendaStats stats={stats} />

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
      </div>

      {/* Overlay pour fermer le calendrier */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCalendar(false)}
        ></div>
      )}

      {/* Modales */}
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
      />
    </PageWrapper>
  );
};

export default Agenda;
