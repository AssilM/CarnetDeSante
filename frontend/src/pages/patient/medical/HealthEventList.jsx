import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHealthEventContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import ItemsList from "../../../components/patient/common/ItemsList";
import { FaFilter } from "react-icons/fa";

const HealthEventList = () => {
  const navigate = useNavigate();
  const { items, setSelectedItem } = useHealthEventContext();

  // État pour le filtre (jour/mois/année)
  const [activeFilter, setActiveFilter] = useState("jour");

  const handleDetails = (item) => {
    setSelectedItem(item);
    navigate("/medical-profile/details");
  };

  // Filtrer les événements selon le filtre actif
  const filterEvents = () => {
    if (!items || items.length === 0) return [];

    // Dans une vraie application, nous filtrerions par date
    // Pour l'exemple, nous retournons tous les éléments
    return items;
  };

  const filteredEvents = filterEvents();

  // Composant de filtre à afficher en haut à droite
  const FilterComponent = () => (
    <div className="flex items-center gap-2 text-sm">
      <FaFilter className="text-gray-500" />
      <div className="flex bg-gray-100 rounded-lg overflow-hidden">
        <button
          onClick={() => setActiveFilter("jour")}
          className={`px-3 py-1 ${
            activeFilter === "jour"
              ? "bg-primary text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          Jour
        </button>
        <button
          onClick={() => setActiveFilter("mois")}
          className={`px-3 py-1 ${
            activeFilter === "mois"
              ? "bg-primary text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          Mois
        </button>
        <button
          onClick={() => setActiveFilter("année")}
          className={`px-3 py-1 ${
            activeFilter === "année"
              ? "bg-primary text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          Année
        </button>
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <ItemsList
        items={filteredEvents}
        type="history"
        title="Historique de santé"
        description="Tous vos événements de santé"
        onViewDetails={handleDetails}
        backUrl="/medical-profile"
        rightAction={<FilterComponent />}
        itemNameField="title"
        itemSubtitleField="doctor"
        detailsText="Détails"
        countText={`${filteredEvents.length} événement${
          filteredEvents.length > 1 ? "s" : ""
        } - ${
          activeFilter === "jour"
            ? "Aujourd'hui"
            : activeFilter === "mois"
            ? "Ce mois-ci"
            : "Cette année"
        }`}
      />
    </PageWrapper>
  );
};

export default HealthEventList;
