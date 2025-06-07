import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVaccinationContext } from "../../../context/VaccinationContext";
import PageWrapper from "../../../components/PageWrapper";
import ItemsList from "../../../components/common/ItemsList";
import AddVaccineForm from "../../../components/patient/vaccination/AddVaccineForm";

const Vaccination = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const { setSelectedVaccine } = useVaccinationContext();

  // Données de test
  const vaccines = [
    {
      id: "1",
      name: "Vaccin COVID-19",
      date: "15/01/2024",
      doctor: "Dr. Martin",
      subtitle: "Lot: ABC123",
      location: "Centre de vaccination",
      nextDose: "15/07/2024",
      type: "ARNm",
      manufacturer: "Pfizer",
    },
    {
      id: "2",
      name: "Vaccin Grippe",
      date: "01/11/2023",
      doctor: "Dr. Dupont",
      subtitle: "Lot: XYZ789",
      location: "Cabinet médical",
      type: "Inactivé",
      manufacturer: "Sanofi",
    },
    {
      id: "3",
      name: "Rappel DTP",
      date: "10/06/2023",
      doctor: "Dr. Bernard",
      subtitle: "Lot: DEF456",
      location: "Hôpital Central",
      nextDose: "10/06/2033",
      type: "Combiné",
      manufacturer: "GSK",
    },
  ];

  const handleAddVaccine = (data) => {
    console.log("Nouveau vaccin:", data);
    setShowAddForm(false);
  };

  const handleViewDetails = (vaccine) => {
    setSelectedVaccine(vaccine);
    navigate("/vaccination/details");
  };

  const handleGenerateReport = () => {
    console.log("Générer le récapitulatif des vaccinations");
  };

  const content = () => {
    if (showAddForm) {
      return (
        <div className="mt-10">
          <AddVaccineForm
            onSubmit={handleAddVaccine}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      );
    }

    const generateReportButton = (
      <button
        onClick={handleGenerateReport}
        className="px-4 py-2 text-sm font-medium text-primary bg-secondary rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Générer un récapitulatif
      </button>
    );

    return (
      <ItemsList
        items={vaccines}
        type="vaccine"
        title="Vaccination"
        description="Permet de retrouver et d'ajouter des vaccins"
        onAdd={() => setShowAddForm(true)}
        onViewDetails={handleViewDetails}
        addButtonText="Ajouter un vaccin"
        rightAction={generateReportButton}
      />
    );
  };

  return <PageWrapper>{content()}</PageWrapper>;
};

export default Vaccination;
