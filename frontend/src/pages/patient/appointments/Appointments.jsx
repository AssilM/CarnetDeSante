import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import { useAppointmentContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList } from "../../../components/patient/common";

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectItem, setItems, items } = useAppointmentContext();

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

  // Initialisation des données de test
  useEffect(() => {
    if (items.length === 0) {
      setItems([
        {
          id: "1",
          title: "Rendez-vous chez le dentiste",
          date: "10/05/2025",
          doctor: "Docteur X",
          location: "Cabinet médical",
          description: "Contrôle dentaire régulier",
          pinned: true,
          type: "dental",
          status: "confirmed",
          timestamp: new Date(2025, 4, 10).getTime(),
        },
        {
          id: "2",
          title: "Suivi médical général",
          date: "12/06/2025",
          doctor: "Docteur Y",
          location: "Hôpital B",
          description: "Bilan annuel de santé",
          pinned: false,
          type: "general",
          status: "confirmed",
          timestamp: new Date(2025, 5, 12).getTime(),
        },
        {
          id: "3",
          title: "Examen ophtalmologique",
          date: "20/02/2024",
          doctor: "Docteur Z",
          location: "Clinique C",
          description: "Contrôle de la vue",
          pinned: false,
          type: "ophthalmology",
          status: "completed",
          timestamp: new Date(2024, 1, 20).getTime(),
        },
        {
          id: "4",
          title: "Consultation cardiologie",
          date: "15/01/2024",
          doctor: "Docteur A",
          location: "Centre Cardiologique",
          description: "Électrocardiogramme et bilan",
          pinned: false,
          type: "cardiology",
          status: "completed",
          timestamp: new Date(2024, 0, 15).getTime(),
        },
      ]);
    }
  }, [setItems, items.length]);

  // Filtrer les rendez-vous selon l'onglet actif
  const currentDate = new Date().getTime();
  const upcomingAppointments = items.filter(
    (item) => item.timestamp > currentDate
  );
  const pastAppointments = items.filter(
    (item) => item.timestamp <= currentDate
  );

  const handleViewDetails = (appointment) => {
    selectItem(appointment);
    navigate("/appointments/details");
  };

  const handleAddAppointment = () => {
    // Cette fonction sera implémentée plus tard pour la prise de rendez-vous
    console.log("Prendre un rendez-vous");
    navigate("/book");
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

      {/* Contenu principal - Affichage conditionnel selon l'onglet actif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "upcoming" ? (
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
            itemSubtitleField="doctor"
            countText={`${upcomingAppointments.length} ${
              upcomingAppointments.length > 1
                ? "rendez-vous programmés"
                : "rendez-vous programmé"
            }`}
            showPinnedSection={false}
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
            itemSubtitleField="doctor"
            countText={`${pastAppointments.length} ${
              pastAppointments.length > 1
                ? "rendez-vous passés"
                : "rendez-vous passé"
            }`}
            showPinnedSection={false}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default Appointments;
