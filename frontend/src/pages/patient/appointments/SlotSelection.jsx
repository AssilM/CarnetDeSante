import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaArrowLeft } from "react-icons/fa";
import { useAppContext } from "../../../context";
import { createDoctorService } from "../../../services/api";
import { httpService } from "../../../services/http";
import PageWrapper from "../../../components/PageWrapper";

const doctorService = createDoctorService(httpService);

const SlotSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [allSlots, setAllSlots] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [jourDisponibilites, setJourDisponibilites] = useState(null);

  // Récupérer les informations du médecin depuis l'état de navigation
  useEffect(() => {
    if (location.state?.doctor) {
      setDoctor(location.state.doctor);
    } else {
      navigate("/book-appointment");
    }
  }, [location.state, navigate]);

  // Générer les dates disponibles pour les 30 prochains jours
  useEffect(() => {
    if (!doctor) return;

    const generateAvailableDates = async () => {
      const days = [];
      const today = new Date();
      const todayStr = formatDateForAPI(today);

      // Générer les dates pour les 30 prochains jours
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Formater la date pour l'affichage et l'API
        const formattedDate = formatDateForAPI(date);
        const dayOfWeek = getDayOfWeek(date);

        // N'ajoute la date que si elle est strictement supérieure à aujourd'hui
        if (formattedDate > todayStr) {
          days.push({
            date: formattedDate,
            dayName: dayOfWeek,
            formattedDisplay: formatDateForDisplay(date),
            dayNumber: date.getDate(),
            month: getMonthName(date),
          });
        }
      }

      setAvailableDays(days);
    };

    generateAvailableDates();
  }, [doctor]);

  // Charger les créneaux disponibles lorsque la date est sélectionnée
  useEffect(() => {
    if (!selectedDate || !doctor) return;

    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        const response = await doctorService.getAvailableSlots(
          doctor.id,
          selectedDate
        );

        // Récupérer les créneaux disponibles depuis la réponse
        const availableSlots = response.creneaux || [];

        // Marquer tous les créneaux comme disponibles (puisqu'ils sont déjà filtrés par le backend)
        const slotsWithStatus = availableSlots.map((slot) => ({
          ...slot,
          disponible: true,
        }));

        setAllSlots(slotsWithStatus);
        setJourDisponibilites(response.jour || null);
      } catch (error) {
        console.error("Erreur lors de la récupération des créneaux:", error);
        showError("Impossible de récupérer les créneaux disponibles");
        setAllSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, doctor, showError]);

  // Formater une date pour l'API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Formater une date pour l'affichage (DD/MM/YYYY)
  const formatDateForDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Obtenir le nom du jour de la semaine
  const getDayOfWeek = (date) => {
    const days = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    return days[date.getDay()];
  };

  // Obtenir le nom du mois
  const getMonthName = (date) => {
    const months = [
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
    return months[date.getMonth()];
  };

  // Formater l'heure pour l'affichage (HH:MM:SS -> HH:MM)
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Gérer la sélection d'un créneau
  const handleSlotSelection = (slot) => {
    if (slot.disponible) {
      setSelectedSlot(slot.heure);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = () => {
    if (!selectedDate || !selectedSlot) {
      showError("Veuillez sélectionner une date et un créneau horaire");
      return;
    }

    navigate("/book-appointment/confirmation", {
      state: {
        doctor,
        date: selectedDate,
        time: selectedSlot,
        formattedDate: availableDays.find((day) => day.date === selectedDate)
          ?.formattedDisplay,
        formattedTime: formatTimeForDisplay(selectedSlot),
      },
    });
  };

  // Regrouper les créneaux par période de la journée
  const groupSlotsByPeriod = () => {
    const morning = [];
    const afternoon = [];
    const evening = [];

    allSlots.forEach((slot) => {
      const hour = parseInt(slot.heure.split(":")[0], 10);

      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlotsByPeriod();

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>

        <h1 className="text-2xl font-bold text-blue-800 mb-6">
          Choisir un créneau
        </h1>

        {doctor && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Dr. {doctor.nom} {doctor.prenom}
            </h2>
            <p className="text-gray-600">{doctor.specialite}</p>
            {doctor.adresse && (
              <p className="text-gray-600">
                {doctor.adresse}, {doctor.code_postal} {doctor.ville}
              </p>
            )}
            {doctor.tel && (
              <p className="text-gray-600">Téléphone: {doctor.tel}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" /> Sélectionner une
            date
          </h2>

          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-2 min-w-max">
              {availableDays.map((day) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center p-3 rounded-lg min-w-[80px] transition-colors ${
                    selectedDate === day.date
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xs font-medium">{day.dayName}</span>
                  <span className="text-xl font-bold">{day.dayNumber}</span>
                  <span className="text-xs">{day.month}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <FaClock className="mr-2 text-blue-600" /> Créneaux disponibles
            </h2>

            {jourDisponibilites && (
              <div className="mb-4 text-sm text-gray-600">
                <p>
                  Jour sélectionné:{" "}
                  <span className="font-medium capitalize">
                    {jourDisponibilites}
                  </span>
                </p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des créneaux...</p>
              </div>
            ) : allSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun créneau disponible pour cette date.</p>
                <p className="mt-2">Veuillez sélectionner une autre date.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {morning.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">
                      Matin
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {morning.map((slot) => (
                        <button
                          key={slot.heure}
                          onClick={() => handleSlotSelection(slot)}
                          disabled={!slot.disponible}
                          className={`p-2 rounded text-center transition-colors ${
                            !slot.disponible
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : selectedSlot === slot.heure
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-800"
                          }`}
                          title={!slot.disponible ? "Créneau déjà réservé" : ""}
                        >
                          {formatTimeForDisplay(slot.heure)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoon.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">
                      Après-midi
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {afternoon.map((slot) => (
                        <button
                          key={slot.heure}
                          onClick={() => handleSlotSelection(slot)}
                          disabled={!slot.disponible}
                          className={`p-2 rounded text-center transition-colors ${
                            !slot.disponible
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : selectedSlot === slot.heure
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-800"
                          }`}
                          title={!slot.disponible ? "Créneau déjà réservé" : ""}
                        >
                          {formatTimeForDisplay(slot.heure)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {evening.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">
                      Soir
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {evening.map((slot) => (
                        <button
                          key={slot.heure}
                          onClick={() => handleSlotSelection(slot)}
                          disabled={!slot.disponible}
                          className={`p-2 rounded text-center transition-colors ${
                            !slot.disponible
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : selectedSlot === slot.heure
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-800"
                          }`}
                          title={!slot.disponible ? "Créneau déjà réservé" : ""}
                        >
                          {formatTimeForDisplay(slot.heure)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 mt-6 border-t">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedSlot}
                    className={`w-full py-3 rounded-lg font-medium ${
                      selectedSlot
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Confirmer ce créneau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default SlotSelection;
