import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useDoctorContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const SlotSelection = () => {
  const navigate = useNavigate();
  const {
    selectedDoctor,
    getAvailableSlots,
    setSelectedDate,
    setSelectedSlot,
  } = useDoctorContext();

  const [selectedDateState, setSelectedDateState] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Rediriger si aucun médecin n'est sélectionné
  useEffect(() => {
    if (!selectedDoctor) {
      navigate("/book-appointment");
      return;
    }

    // Générer des dates disponibles pour les 30 prochains jours
    const dates = generateAvailableDates(30);
    setAvailableDates(dates);
  }, [selectedDoctor, navigate]);

  // Générer des dates disponibles pour les N prochains jours
  const generateAvailableDates = (days) => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Exclure les weekends si nécessaire
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Exclure dimanche (0) et samedi (6)
        const formattedDate = formatDateForAPI(date);
        dates.push(formattedDate);
      }
    }

    return dates;
  };

  // Formater une date pour l'API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Charger les créneaux disponibles lorsque la date change
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDateState || !selectedDoctor) return;

      try {
        setLoading(true);
        setError(null);
        const availableSlots = await getAvailableSlots(
          selectedDoctor.id,
          selectedDateState
        );
        setSlots(availableSlots);
      } catch (err) {
        console.error("Erreur lors de la récupération des créneaux:", err);
        setError("Impossible de récupérer les créneaux disponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDateState, selectedDoctor, getAvailableSlots]);

  const handleSelectDate = (date) => {
    setSelectedDateState(date);
  };

  const handleSelectSlot = (slot) => {
    setSelectedDate(selectedDateState);
    setSelectedSlot(slot);
    navigate("/book-appointment/confirmation");
  };

  // Formater une date pour l'affichage
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  if (!selectedDoctor) return null;

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={() =>
              navigate(
                "/book-appointment/doctor?specialty=" +
                  encodeURIComponent(selectedDoctor.specialite)
              )
            }
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Retour à la liste des médecins
          </button>
        </div>

        {/* Informations du médecin */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                <img
                  src={selectedDoctor.photo || "https://via.placeholder.com/64"}
                  alt={`${selectedDoctor.prenom} ${selectedDoctor.nom}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDoctor.prenom} {selectedDoctor.nom}
              </h2>
              <p className="text-primary font-medium">
                {selectedDoctor.specialite}
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                {selectedDoctor.adresse || "Adresse non spécifiée"}
              </div>
            </div>
          </div>
        </div>

        {/* Affichage de l'erreur si nécessaire */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Sélection de date et créneau */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900">
              Sélectionnez une date et un créneau
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choisissez parmi les disponibilités suivantes
            </p>
          </div>

          {/* Sélection de date */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FaCalendarAlt className="mr-2 text-primary" /> Dates disponibles
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableDates.slice(0, 10).map((date) => (
                <button
                  key={date}
                  onClick={() => handleSelectDate(date)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedDateState === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection de créneau */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FaClock className="mr-2 text-primary" /> Créneaux disponibles
            </h4>

            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-600">Chargement des créneaux...</p>
              </div>
            ) : !selectedDateState ? (
              <p className="text-gray-600 text-sm">
                Veuillez d'abord sélectionner une date
              </p>
            ) : slots.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Aucun créneau disponible pour cette date
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleSelectSlot(slot)}
                    className="px-4 py-3 bg-gray-100 rounded-lg text-center hover:bg-gray-200 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{slot}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SlotSelection;
