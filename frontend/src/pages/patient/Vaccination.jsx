import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import ItemsList from "../../components/common/ItemsList";
import AddVaccineForm from "../../components/patient/vaccination/AddVaccineForm";
import VaccineDetails from "../../components/patient/vaccination/VaccineDetails";

const Vaccination = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  // Données de test
  const vaccines = [
    {
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
      name: "Vaccin Grippe",
      date: "01/11/2023",
      doctor: "Dr. Dupont",
      subtitle: "Lot: XYZ789",
      location: "Cabinet médical",
      type: "Inactivé",
      manufacturer: "Sanofi",
    },
    {
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

    if (selectedVaccine) {
      return (
        <div className="mt-10">
          <VaccineDetails
            vaccine={selectedVaccine}
            onClose={() => setSelectedVaccine(null)}
          />
        </div>
      );
    }

    const generateReportButton = (
      <button
        onClick={handleGenerateReport}
        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
