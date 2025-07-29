import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaSyncAlt } from "react-icons/fa";
import { useAppointmentContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList } from "../../../components/patient/common";

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectAppointment,
    getUpcomingAppointments,
    getPastAppointments,
    loading,
    error,
    refreshAppointments,
  } = useAppointmentContext();

  // Lecture du paramètre de requête pour définir l'onglet actif initial
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get("tab");

  // État pour gérer l'onglet actif (à venir ou passés)
  const [activeTab, setActiveTab] = useState(
    tabParam === "past" ? "past" : "upcoming"
  );

  // Changer l'URL lorsque l'onglet change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/appointments?tab=${tab}`);
  };

  // Récupérer les rendez-vous selon l'onglet actif
  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  const handleViewDetails = (appointment) => {
    selectAppointment(appointment);
    navigate("/appointments/details");
  };

  const handleAddAppointment = () => {
    navigate("/book-appointment");
  };

  const handleRefresh = async () => {
    await refreshAppointments();
  };

  // Transformer les rendez-vous pour l'affichage
  const transformAppointmentsForDisplay = (appointments) => {
    return appointments.map((appointment) => ({
      id: appointment.id,
      title: appointment.title,

      date: appointment.date, // La date est déjà formatée par le contexte

      subtitle: appointment.doctor?.name || "Médecin non spécifié",
      statut: appointment.status,
      type: "appointment",
      onViewDetails: () => handleViewDetails(appointment),
    }));
  };


  const upcomingAppointmentsForDisplay =
    transformAppointmentsForDisplay(upcomingAppointments);
  const pastAppointmentsForDisplay =
    transformAppointmentsForDisplay(pastAppointments);


  return (
    <PageWrapper className="bg-gray-50">
      {/* En-tête de la page avec icône et titre */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Mes rendez-vous
                </h1>
                <p className="text-sm text-gray-600">
                  Retrouver ici tout vos prochains et anciens rendez-vous
                </p>
              </div>
            </div>
            {/* Bouton d'actualisation */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSyncAlt className={`${loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Barre de navigation entre les onglets */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center">
            <div className="flex w-full sm:w-auto justify-between sm:justify-center sm:space-x-8 md:space-x-12">
              {/* Bouton pour l'onglet Rendez-vous à venir */}
              <button
                onClick={() => handleTabChange("upcoming")}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap transition-colors ${
                  activeTab === "upcoming"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Rendez-vous à venir
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {upcomingAppointments.length}
                </span>
              </button>
              {/* Bouton pour l'onglet Anciens rendez-vous */}
              <button
                onClick={() => handleTabChange("past")}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap transition-colors ${
                  activeTab === "past"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Anciens rendez-vous
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {pastAppointments.length}
                </span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Affichage de l'erreur si nécessaire */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Contenu principal - Affichage conditionnel selon l'onglet actif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "upcoming" ? (
          // Section Rendez-vous à venir
          <ItemsList
            items={upcomingAppointmentsForDisplay}
            type="appointment"
            title="Rendez-vous à venir"
            description="Vos prochains rendez-vous médicaux"
            onAdd={handleAddAppointment}
            onViewDetails={(item) => item.onViewDetails()}
            addButtonText="Prendre rendez-vous"
            countText={`${upcomingAppointments.length} rendez-vous à venir`}
            showPinnedSection={false}
          />
        ) : (
          // Section Anciens rendez-vous
          <ItemsList
            items={pastAppointmentsForDisplay}
            type="appointment"
            title="Anciens rendez-vous"
            description="Historique de vos rendez-vous passés"
            onViewDetails={(item) => item.onViewDetails()}
            countText={`${pastAppointments.length} anciens rendez-vous`}
            showPinnedSection={false}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default Appointments;
