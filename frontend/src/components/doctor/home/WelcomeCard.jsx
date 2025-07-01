import React from "react";
import { useAuth, useDoctorAppointmentContext } from "../../../context";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WelcomeCard = () => {
  const { currentUser } = useAuth();
  const { appointments } = useDoctorAppointmentContext();
  const navigate = useNavigate();

  // Fonction sécurisée pour formatter les dates
  const formatDateForComparison = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "";
    }
  };

  // Compter les rendez-vous du jour
  const today = formatDateForComparison(new Date());
  const todayAppointments = appointments.filter((appointment) => {
    try {
      if (!appointment.timestamp) return false;

      const appointmentDate = new Date(appointment.timestamp);
      if (isNaN(appointmentDate.getTime())) return false;

      return formatDateForComparison(appointmentDate) === today;
    } catch (error) {
      console.error("Erreur lors de la vérification d'un rendez-vous:", error);
      return false;
    }
  });

  // Naviguer vers la page de gestion d'agenda
  const handleCalendarClick = () => {
    navigate("/doctor/availability");
  };

  // Naviguer vers la page de recherche de patients
  const handleSearchClick = () => {
    // Faire défiler vers la section de recherche sur la page actuelle
    const searchSection = document.querySelector("[data-search-section]");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-blue-700 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Bienvenue Dr. {currentUser?.nom} {currentUser?.prenom}
          </h2>
          <p className="mt-2 text-blue-100">
            Vous avez {todayAppointments.length} rendez-vous aujourd'hui
          </p>
        </div>
        <div className="bg-white p-4 rounded-full">
          <svg
            className="w-12 h-12 text-blue-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
        </div>
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleCalendarClick}
          className="bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition font-medium flex items-center"
        >
          <FaCalendarAlt className="w-5 h-5 mr-2" />
          Agenda du jour
        </button>
        <button
          onClick={handleSearchClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition font-medium flex items-center border border-blue-300"
        >
          <FaSearch className="w-5 h-5 mr-2" />
          Rechercher un patient
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;
