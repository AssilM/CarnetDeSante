import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/PageWrapper";
import { useDoctorAppointmentContext } from "../../context";
import { useAppContext } from "../../context/AppContext";
import {
  WelcomeSection,
  ImminentAppointmentCard,
  UpcomingAppointmentsList,
  AppointmentCalendar,
  SelectedDateAppointments,
  AppointmentDetailModal,
  ErrorAlert,
} from "../../components/doctor/home";

const HomeDoctor = () => {
  const { appointments, loading, error, cancelAppointment } =
    useDoctorAppointmentContext();
  const { showNotification } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  // Pagination pour rendez-vous de la date sélectionnée
  const pageSize = 3;
  const [selectedPage, setSelectedPage] = useState(0);

  // Format date sélectionnée en YYYY-MM-DD (local, pas UTC)
  const formatDateYMD = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date pour affichage humain (JJ/MM/YYYY à HH:MM)
  const formatDateTimeFr = (dateStr, timeStr) => {
    if (!dateStr) return "";
    let d;
    try {
      // dateStr peut être ISO ou YYYY-MM-DD
      d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
    } catch {
      return "";
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let time = timeStr ? timeStr.substring(0, 5) : "";
    return `${day}/${month}/${year}${time ? " à " + time : ""}`;
  };

  // Format date for header display
  const formatHeaderDate = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "";
      }
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("fr-FR", options);
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "";
    }
  };

  const today = formatDateYMD(new Date());
  const selectedDate = formatDateYMD(currentDate);

  // Update appointments when currentDate changes
  useEffect(() => {
    console.log(
      "[HomeDoctor] Mise à jour des rendez-vous pour la date:",
      selectedDate
    );
    console.log(
      "[HomeDoctor] Nombre total de rendez-vous:",
      appointments.length
    );

    if (appointments.length > 0) {
      const now = new Date();
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      // Rendez-vous du jour dont l'heure est > maintenant
      const todayYMD = formatDateYMD(now);
      const currentTime = now.toTimeString().slice(0, 5); // 'HH:MM'
      const upcoming = appointments
        .filter((app) => {
          if (!app.timestamp || app.status === "annulé") return false;
          // Rendez-vous du jour : heure > maintenant
          if (app.dateOnly === todayYMD) {
            return app.time && app.time > currentTime;
          }
          // Rendez-vous futurs (date > aujourd'hui)
          return app.timestamp > now.getTime();
        })
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, 5);
      setUpcomingAppointments(upcoming);
      // Filtrage fiable par date brute + tri par heure croissante
      const dateAppts = appointments
        .filter((appointment) => appointment.dateOnly === selectedDate)
        .sort((a, b) => {
          if (a.time && b.time) {
            return a.time.localeCompare(b.time);
          }
          return 0;
        });
      setSelectedDateAppointments(dateAppts);
    } else {
      setUpcomingAppointments([]);
      setSelectedDateAppointments([]);
    }
  }, [appointments, selectedDate]);

  // Réinitialise la page quand la liste change
  useEffect(() => {
    setSelectedPage(0);
  }, [selectedDateAppointments]);

  // Rafraîchit l'heure toutes les 5 s pour une mise à jour plus réactive
  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle calendar date change
  const handleDateChange = (date) => {
    if (date) {
      console.log("[HomeDoctor] Date sélectionnée:", date);
      setCurrentDate(date);
    }
  };

  // Fonction pour ouvrir le détail
  const handleShowDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
    setCancelError(null);
  };

  // Fonction pour fermer le détail
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedAppointment(null);
    setCancelError(null);
  };

  // Fonction pour annuler le rendez-vous
  const handleCancel = async () => {
    if (!selectedAppointment) return;
    if (!window.confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelAppointment(selectedAppointment.id);
      setShowDetail(false);
      showNotification({
        type: "success",
        message: "Rendez-vous annulé avec succès !",
      });
    } catch {
      setCancelError("Erreur lors de l'annulation du rendez-vous");
    } finally {
      setCancelLoading(false);
    }
  };

  // Récupérer le premier rendez-vous imminent
  const imminentAppointment =
    upcomingAppointments && upcomingAppointments.length > 0
      ? upcomingAppointments[0]
      : null;

  return (
    <PageWrapper className="bg-[#F8F9FA]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Section supérieure : WelcomeCard + Rendez-vous imminent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeSection currentDateTime={currentDateTime} />
            <ImminentAppointmentCard
              imminentAppointment={imminentAppointment}
              onShowDetail={handleShowDetail}
              formatDateTimeFr={formatDateTimeFr}
            />
          </div>

          {/* Affichage des erreurs */}
          <ErrorAlert error={error} />

          {/* Rendez-vous à venir */}
          <UpcomingAppointmentsList
            upcomingAppointments={upcomingAppointments}
            loading={loading}
            onShowDetail={handleShowDetail}
            formatDateTimeFr={formatDateTimeFr}
          />
        </div>

        {/* Colonne de droite - Calendrier */}
        <div className="space-y-6">
          <AppointmentCalendar
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />

          {/* Rendez-vous de la date sélectionnée */}
          <SelectedDateAppointments
            selectedDateAppointments={selectedDateAppointments}
            selectedDate={selectedDate}
            today={today}
            currentDate={currentDate}
            formatHeaderDate={formatHeaderDate}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            pageSize={pageSize}
          />
        </div>
      </div>

      {/* Modal de détail */}
      <AppointmentDetailModal
        showDetail={showDetail}
        selectedAppointment={selectedAppointment}
        onCloseDetail={handleCloseDetail}
        onCancel={handleCancel}
        cancelLoading={cancelLoading}
        cancelError={cancelError}
        formatDateTimeFr={formatDateTimeFr}
      />
    </PageWrapper>
  );
};

export default HomeDoctor;
