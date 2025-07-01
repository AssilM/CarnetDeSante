import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
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

  return (
    <PageWrapper className="bg-gray-50">
      {/* En-tête de la page avec icône et titre */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              </button>
              {/* Bouton pour l'onglet Rendez-vous passés */}
              <button
                onClick={() => handleTabChange("past")}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap transition-colors ${
                  activeTab === "past"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Anciens rendez-vous
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
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Chargement des rendez-vous...</p>
          </div>
        ) : activeTab === "upcoming" ? (
          // Section Rendez-vous à venir
          <ItemsList
            items={upcomingAppointments}
            type="appointment"
            title="Rendez-vous à venir"
            description="Vos prochains rendez-vous médicaux"
            onAdd={handleAddAppointment}
            onViewDetails={handleViewDetails}
            addButtonText="Prendre rendez-vous"
            itemNameField="title"
            itemSubtitleField="doctor.name"
            countText={`${upcomingAppointments.length} ${
              upcomingAppointments.length > 1
                ? "rendez-vous programmés"
                : "rendez-vous programmé"
            }`}
            showPinnedSection={false}
            emptyMessage="Vous n'avez pas de rendez-vous à venir"
          />
        ) : (
          // Section Rendez-vous passés
          <ItemsList
            items={pastAppointments}
            type="appointment"
            title="Anciens rendez-vous"
            description="Historique de vos rendez-vous médicaux"
            onViewDetails={handleViewDetails}
            itemNameField="title"
            itemSubtitleField="doctor.name"
            countText={`${pastAppointments.length} ${
              pastAppointments.length > 1
                ? "rendez-vous passés"
                : "rendez-vous passé"
            }`}
            showPinnedSection={false}
            emptyMessage="Vous n'avez pas d'historique de rendez-vous"
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default Appointments;
