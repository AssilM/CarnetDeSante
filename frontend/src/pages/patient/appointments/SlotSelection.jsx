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

  // Rediriger si aucun médecin n'est sélectionné
  useEffect(() => {
    if (!selectedDoctor) {
      navigate("/book-appointment");
      return;
    }

    // Extraire les dates disponibles du médecin sélectionné
    const dates = selectedDoctor.availableSlots.map((slot) => slot.date);
    setAvailableDates(dates);
  }, [selectedDoctor, navigate]);

  const availableSlots = selectedDateState
    ? getAvailableSlots(selectedDoctor?.id, selectedDateState)
    : [];

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
                  encodeURIComponent(selectedDoctor.specialty)
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
                  src={selectedDoctor.image || "https://via.placeholder.com/64"}
                  alt={`${selectedDoctor.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDoctor.name}
              </h2>
              <p className="text-primary font-medium">
                {selectedDoctor.specialty}
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                {selectedDoctor.address}
              </div>
            </div>
          </div>
        </div>

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
              {availableDates.map((date) => (
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

            {!selectedDateState ? (
              <p className="text-gray-600 text-sm">
                Veuillez d'abord sélectionner une date
              </p>
            ) : availableSlots.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Aucun créneau disponible pour cette date
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
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
