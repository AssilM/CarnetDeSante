import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaSync,
  FaPlus,
  FaChevronDown,
} from "react-icons/fa";
import PageWrapper from "../../components/PageWrapper";
import { useDoctorAppointmentContext, useAuth } from "../../context";

const HomeDoctor = () => {
  const { currentUser } = useAuth();
  const { appointments, loading, error } = useDoctorAppointmentContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

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
      // Get upcoming appointments (future dates)
      const now = new Date().getTime();
      const upcoming = appointments
        .filter((app) => {
          try {
            if (!app.timestamp) return false;
            return app.timestamp > now && app.status !== "annulé";
          } catch (error) {
            console.error(
              "Erreur lors du filtrage des rendez-vous à venir:",
              error
            );
            return false;
          }
        })
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, 10); // Limit to 10 appointments

      console.log("[HomeDoctor] Rendez-vous à venir trouvés:", upcoming.length);
      setUpcomingAppointments(upcoming);

      // Filtrage fiable par date brute
      const dateAppts = appointments.filter((appointment) => {
        return appointment.dateOnly === selectedDate;
      });
      setSelectedDateAppointments(dateAppts);
    } else {
      setUpcomingAppointments([]);
      setSelectedDateAppointments([]);
    }
  }, [appointments, selectedDate]);

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

  // Calendar data
  const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  // Get calendar days for current month view
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay() || 7; // If 0 (Sunday), convert to 7
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Add empty cells for days before the first day of month
    for (let i = 1; i < firstDay; i++) {
      days.push({ day: "", empty: true });
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentMonthDate = new Date(year, month, i);
      const currentMonthDateStr = formatDateYMD(currentMonthDate);

      days.push({
        day: i,
        empty: false,
        date: currentMonthDate,
        isToday: today === currentMonthDateStr,
        isSelected: selectedDate === currentMonthDateStr,
        hasAppointments: appointments.some((appt) => {
          try {
            if (!appt.timestamp) return false;
            const apptDate = new Date(appt.timestamp);
            if (isNaN(apptDate.getTime())) return false;
            return formatDateYMD(apptDate) === currentMonthDateStr;
          } catch (error) {
            console.error("Erreur lors de la comparaison des dates:", error);
            return false;
          }
        }),
      });
    }

    return days;
  };

  // Previous and next month navigation
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Handle day selection in calendar
  const handleDayClick = (date) => {
    if (date) {
      console.log("[HomeDoctor] Date sélectionnée:", date);
      setCurrentDate(date);
    }
  };

  // Handle month/year selection
  const handleMonthYearSelect = (month, year) => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  // Generate years for picker (current year - 2 to current year + 2)
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMonthPicker && !event.target.closest(".month-picker")) {
        setShowMonthPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMonthPicker]);

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

  return (
    <PageWrapper className="bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto p-4">
        <div className="lg:col-span-3 space-y-4">
          {/* En-tête avec nom du médecin */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Dr. {currentUser?.nom} {currentUser?.prenom}
            </h1>
            <p className="text-gray-600 mt-2">{currentUser?.specialite}</p>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
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
                  <h3 className="text-sm font-medium text-red-800">
                    Erreur de connexion
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rendez-vous à venir */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-500" /> Prochains
                rendez-vous
              </h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Aucun rendez-vous à venir pour le moment
                </div>
              ) : (
                <div
                  className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 snap-x snap-mandatory"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="min-w-[85vw] sm:min-w-[320px] max-w-xs bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 flex-shrink-0 snap-center shadow-sm transition-all duration-200 hover:scale-[1.03]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">
                            {appointment.patient.name}
                          </h3>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            +{appointment.patient.id}
                          </div>
                          <div className="mt-3 flex flex-col space-y-2">
                            <span className="bg-white px-2 py-1 rounded-md text-xs text-blue-800">
                              {appointment.title}
                            </span>
                            <span className="text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
                              <FaCalendarAlt className="mr-1" size={12} />
                              {formatDateTimeFr(
                                appointment.dateRaw,
                                appointment.time
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-medium text-gray-600">
                            {appointment.time}
                          </div>
                          <div className="flex space-x-2 mt-6">
                            <button className="text-blue-500 hover:text-blue-700">
                              <FaEye />
                            </button>
                            <button className="text-blue-500 hover:text-blue-700">
                              <FaEdit />
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
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={prevMonth}
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded"
              >
                &lt;
              </button>

              {/* Sélecteur de mois/année */}
              <div className="relative month-picker">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="text-lg font-medium hover:bg-gray-100 px-3 py-1 rounded flex items-center"
                >
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                  <FaChevronDown className="ml-2 text-sm" />
                </button>

                {showMonthPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 min-w-[200px]">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {monthNames.map((month, index) => (
                        <button
                          key={month}
                          onClick={() =>
                            handleMonthYearSelect(
                              index,
                              currentDate.getFullYear()
                            )
                          }
                          className={`text-sm p-2 rounded hover:bg-blue-50 ${
                            index === currentDate.getMonth()
                              ? "bg-blue-100 text-blue-700"
                              : ""
                          }`}
                        >
                          {month.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-3 gap-2">
                        {getYearRange().map((year) => (
                          <button
                            key={year}
                            onClick={() =>
                              handleMonthYearSelect(
                                currentDate.getMonth(),
                                year
                              )
                            }
                            className={`text-sm p-2 rounded hover:bg-blue-50 ${
                              year === currentDate.getFullYear()
                                ? "bg-blue-100 text-blue-700"
                                : ""
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={nextMonth}
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded"
              >
                &gt;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 p-2"
                >
                  {day}
                </div>
              ))}

              {getDaysInMonth().map((item, index) => (
                <div
                  key={index}
                  onClick={() => item.date && handleDayClick(item.date)}
                  className={`text-center p-2 rounded-md cursor-pointer ${
                    item.empty
                      ? ""
                      : item.isSelected
                      ? "bg-blue-600 text-white"
                      : item.isToday
                      ? "border border-blue-600 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item.day}
                </div>
              ))}
            </div>
          </div>

          {/* Rendez-vous de la date sélectionnée */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-medium mb-4">
              {selectedDate === today
                ? "Rendez-vous d'aujourd'hui"
                : `Rendez-vous du ${formatHeaderDate(currentDate)}`}
            </h3>

            {selectedDateAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun rendez-vous{" "}
                {selectedDate === today ? "aujourd'hui" : "ce jour-là"}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-md p-2 mr-3">
                        {appointment.time}
                      </div>
                      <div>
                        <div className="font-medium">
                          {appointment.patient.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.title}
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
    </PageWrapper>
  );
};

export default HomeDoctor;
