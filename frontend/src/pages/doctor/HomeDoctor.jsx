import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaChevronDown,
  FaUser,
  FaClock,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Calendar from "react-calendar";
import PageWrapper from "../../components/PageWrapper";
import { useDoctorAppointmentContext, useAuth } from "../../context";
import { useAppContext } from "../../context/AppContext";
import "react-calendar/dist/Calendar.css";

const HomeDoctor = () => {
  const { currentUser } = useAuth();
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

  // Handle calendar date change
  const handleDateChange = (date) => {
    if (date) {
      console.log("[HomeDoctor] Date sélectionnée:", date);
      setCurrentDate(date);
    }
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

  return (
    <PageWrapper className="bg-[#F8F9FA]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Section supérieure : WelcomeCard + Rendez-vous imminent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-[#E8F4FD] to-white rounded-lg relative overflow-hidden p-6 shadow-sm border border-[#E9ECEF] transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-[#343A40] mb-1">
                    Bonjour, Dr. {currentUser?.nom} {currentUser?.prenom}
                  </h1>
                  <p className="text-[#6C757D] text-base mb-3">
                    {currentUser?.specialite}
                  </p>
                  {/* Date & heure courantes */}
                  <div className="flex items-center text-sm text-[#6C757D] space-x-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1 text-[#4A90E2]" />
                      <span>
                        {currentDateTime.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1 text-[#4A90E2]" />
                      <span>
                        {currentDateTime.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#E8F4FD] rounded-full p-4 flex-shrink-0 relative z-10">
                  <FaUser className="text-[#4A90E2] text-2xl" />
                </div>
              </div>
            </div>

            {/* Carte rendez-vous imminent */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E9ECEF] p-6 transition-all duration-200 hover:shadow-md">
              <div className="border-b border-[#E9ECEF] pb-4 mb-4">
                <h2 className="text-xl font-semibold text-[#343A40] flex items-center">
                  <FaClock className="mr-3 text-[#4A90E2]" /> Rendez-vous
                  imminent
                </h2>
              </div>

              {(() => {
                const imminentAppointment =
                  upcomingAppointments && upcomingAppointments.length > 0
                    ? upcomingAppointments[0]
                    : null;

                if (!imminentAppointment) {
                  return (
                    <div className="text-center py-8 text-[#6C757D]">
                      <FaCalendarAlt className="mx-auto text-3xl text-[#E9ECEF] mb-3" />
                      <p className="text-sm">Aucun rendez-vous imminent</p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center">
                      <div className="bg-[#4A90E2] text-white rounded-full h-12 w-12 flex items-center justify-center mr-4 text-lg font-semibold">
                        {imminentAppointment.time}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#343A40]">
                          {imminentAppointment.patient.name}
                        </h3>
                        <p className="text-sm text-[#6C757D]">
                          {imminentAppointment.title}
                        </p>
                        <p className="text-sm text-[#6C757D]">
                          {formatDateTimeFr(
                            imminentAppointment.dateRaw,
                            imminentAppointment.time
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleShowDetail(imminentAppointment)}
                      className="self-start sm:self-auto px-4 py-2 bg-[#4A90E2] text-white rounded-lg text-sm font-medium hover:bg-[#2E5BBA] transition-colors"
                    >
                      Voir les détails
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-[#DC3545] bg-opacity-10 border border-[#DC3545] border-opacity-20 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-[#DC3545]"
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
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[#DC3545]">
                    Erreur de connexion
                  </h3>
                  <div className="mt-2 text-sm text-[#DC3545] opacity-80">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rendez-vous à venir */}
          <div className="bg-white rounded-lg shadow-sm border border-[#E9ECEF] transition-all duration-200 hover:shadow-md">
            <div className="border-b border-[#E9ECEF] px-6 py-4">
              <h2 className="text-xl font-semibold text-[#343A40] flex items-center">
                <FaCalendarAlt className="mr-3 text-[#4A90E2]" /> Prochains
                rendez-vous
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A90E2]"></div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-12 text-[#6C757D]">
                  <FaCalendarAlt className="mx-auto text-4xl text-[#E9ECEF] mb-4" />
                  <p className="text-lg">
                    Aucun rendez-vous à venir pour le moment
                  </p>
                </div>
              ) : (
                <div
                  className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#4A90E2] scrollbar-track-[#E8F4FD] snap-x snap-mandatory"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="min-w-[85vw] sm:min-w-[320px] max-w-xs bg-white border border-[#E9ECEF] p-6 rounded-lg flex-shrink-0 snap-center shadow-sm transition-all duration-200 hover:shadow-md hover:transform hover:scale-[1.02]"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="bg-[#E8F4FD] rounded-full p-2 mr-3">
                              <FaUser className="text-[#4A90E2] text-sm" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-base text-[#343A40]">
                                {appointment.patient.name}
                              </h3>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <span className="inline-block bg-[#E8F4FD] text-[#4A90E2] px-3 py-1 rounded-full text-xs font-medium">
                              {appointment.title}
                            </span>
                            <div className="flex items-center text-[#6C757D] text-sm">
                              <FaClock className="mr-2 text-[#4A90E2]" />
                              <span>
                                {formatDateTimeFr(
                                  appointment.dateRaw,
                                  appointment.time
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="flex items-center justify-center bg-[#4A90E2] text-white rounded-lg px-3 py-2 text-sm font-medium mb-4 min-w-[60px] min-h-[36px]">
                            {appointment.time}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="text-[#4A90E2] hover:text-[#2E5BBA] p-2 rounded-lg hover:bg-[#E8F4FD] transition-colors"
                              onClick={() => handleShowDetail(appointment)}
                            >
                              <FaEye />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite - Calendrier */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-[#E9ECEF] p-6 transition-all duration-200 hover:shadow-md">
            <h3 className="text-lg font-semibold text-[#343A40] mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-[#4A90E2]" />
              Calendrier
            </h3>

            <style jsx>{`
              .react-calendar {
                width: 100%;
                max-width: 100%;
                background: white;
                border: none;
                font-family: system-ui, -apple-system, "Segoe UI", Roboto,
                  sans-serif;
                line-height: 1.125em;
              }

              .react-calendar--doubleView {
                width: 700px;
              }

              .react-calendar--doubleView .react-calendar__viewContainer {
                display: flex;
                margin: -0.5em;
              }

              .react-calendar--doubleView .react-calendar__viewContainer > * {
                width: 50%;
                margin: 0.5em;
              }

              .react-calendar *,
              .react-calendar *:before,
              .react-calendar *:after {
                -moz-box-sizing: border-box;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
              }

              .react-calendar button {
                margin: 0;
                border: 0;
                outline: none;
              }

              .react-calendar button:enabled:hover {
                background-color: #e8f4fd;
                border-radius: 6px;
              }

              .react-calendar__navigation {
                display: flex;
                height: 44px;
                margin-bottom: 1em;
              }

              .react-calendar__navigation button {
                min-width: 44px;
                background: none;
                font-size: 16px;
                font-weight: 600;
                color: #343a40;
              }

              .react-calendar__navigation button:disabled {
                background-color: #f0f0f0;
              }

              .react-calendar__navigation button:enabled:hover,
              .react-calendar__navigation button:enabled:focus {
                background-color: #e8f4fd;
                border-radius: 6px;
              }

              .react-calendar__month-view__weekdays {
                text-align: center;
                text-transform: uppercase;
                font-weight: bold;
                font-size: 0.75em;
                color: #6c757d;
              }

              .react-calendar__month-view__weekdays__weekday {
                padding: 0.5em;
              }

              .react-calendar__month-view__weekNumbers .react-calendar__tile {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75em;
                font-weight: bold;
              }

              .react-calendar__month-view__days__day--weekend {
                color: #dc3545;
              }

              .react-calendar__month-view__days__day--neighboringMonth {
                color: #e9ecef;
              }

              .react-calendar__year-view .react-calendar__tile,
              .react-calendar__decade-view .react-calendar__tile,
              .react-calendar__century-view .react-calendar__tile {
                padding: 2em 0.5em;
              }

              .react-calendar__tile {
                max-width: 100%;
                padding: 10px 6.6667px;
                background: none;
                text-align: center;
                line-height: 16px;
                font-size: 14px;
                color: #343a40;
                position: relative;
              }

              .react-calendar__tile:enabled:hover,
              .react-calendar__tile:enabled:focus {
                background-color: #e8f4fd;
                border-radius: 6px;
              }

              .react-calendar__tile--now {
                background: #e8f4fd;
                border: 2px solid #4a90e2;
                border-radius: 6px;
                font-weight: 600;
                color: #4a90e2;
              }

              .react-calendar__tile--now:enabled:hover,
              .react-calendar__tile--now:enabled:focus {
                background: #4a90e2;
                color: white;
              }

              .react-calendar__tile--hasActive {
                background: #4a90e2;
                color: white;
                border-radius: 6px;
              }

              .react-calendar__tile--hasActive:enabled:hover,
              .react-calendar__tile--hasActive:enabled:focus {
                background: #2e5bba;
              }

              .react-calendar__tile--active {
                background: #4a90e2;
                color: white;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
              }

              .react-calendar__tile--active:enabled:hover,
              .react-calendar__tile--active:enabled:focus {
                background: #2e5bba;
              }

              .react-calendar--selectRange .react-calendar__tile--hover {
                background-color: #e8f4fd;
              }
            `}</style>

            <Calendar
              onChange={handleDateChange}
              value={currentDate}
              locale="fr-FR"
              maxDetail="month"
              minDetail="month"
              showNeighboringMonth={false}
              className="custom-calendar"
            />
          </div>

          {/* Rendez-vous de la date sélectionnée */}
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
        </div>
      </div>

      {showDetail && selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative border border-[#E9ECEF]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-[#6C757D] hover:text-[#343A40]"
              onClick={handleCloseDetail}
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-2xl font-semibold text-[#343A40] mb-4">
              Détail du rendez-vous
            </h2>
            <div className="space-y-2 text-[#343A40]">
              <div>
                <span className="font-semibold">Patient :</span>{" "}
                {selectedAppointment.patient.name}
              </div>
              <div>
                <span className="font-semibold">Heure :</span>{" "}
                {selectedAppointment.time}
              </div>
              <div>
                <span className="font-semibold">Motif :</span>{" "}
                {selectedAppointment.title}
              </div>
              <div>
                <span className="font-semibold">Date :</span>{" "}
                {formatDateTimeFr(
                  selectedAppointment.dateRaw,
                  selectedAppointment.time
                )}
              </div>
            </div>

            {cancelError && (
              <div className="text-red-600 mb-2 mt-2 text-sm">
                {cancelError}
              </div>
            )}

            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="mt-6 px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#2E5BBA] disabled:opacity-50 w-full sm:w-auto"
            >
              {cancelLoading ? "Annulation..." : "Annuler le rendez-vous"}
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default HomeDoctor;
