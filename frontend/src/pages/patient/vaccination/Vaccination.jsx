import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVaccinationContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList, ActionButton } from "../../../components/patient/common";
import AddVaccineForm from "../../../components/patient/vaccination/AddVaccineForm";
import { useFormModal } from "../../../hooks";

const Vaccination = () => {
  const navigate = useNavigate();
  const { selectItem, setItems, items, addItem, togglePinned } =
    useVaccinationContext();

  // Utilisation du hook personnalisé pour gérer le formulaire d'ajout
  const {
    isOpen: showAddForm,
    openForm,
    closeForm,
    handleSubmit,
  } = useFormModal((data) => {
    // Génération d'un ID unique pour le nouveau vaccin
    const newVaccine = {
      ...data,
      id: `vac-${Date.now()}`,
      date: new Date().toLocaleDateString("fr-FR"),
      pinned: false,
    };

    // Ajout du vaccin via le contexte
    addItem(newVaccine);
    console.log("Nouveau vaccin:", newVaccine);
  });

  // Initialisation des données de test
  useEffect(() => {
    if (items.length === 0) {
      setItems([
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
          pinned: true,
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
          pinned: false,
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
          pinned: false,
        },
      ]);
    }
  }, [setItems, items.length]);

  const handleViewDetails = (vaccine) => {
    selectItem(vaccine);
    navigate("/vaccination/details");
  };

  const handleGenerateReport = () => {
    console.log("Générer le récapitulatif des vaccinations");
  };

  const handleTogglePin = (id) => {
    togglePinned(id);
  };

  const content = () => {
    if (showAddForm) {
      return (
        <div className="mt-10">
          <AddVaccineForm onSubmit={handleSubmit} onCancel={closeForm} />
        </div>
      );
    }

    const generateReportButton = (
      <ActionButton variant="secondary" onClick={handleGenerateReport}>
        Générer un récapitulatif
      </ActionButton>
    );

    return (
      <ItemsList
        items={items}
        type="vaccine"
        title="Vaccination"
        description="Permet de retrouver et d'ajouter des vaccins"
        onAdd={openForm}
        onViewDetails={handleViewDetails}
        onTogglePin={handleTogglePin}
        addButtonText="Ajouter un vaccin"
        rightAction={generateReportButton}
      />
    );
  };

  return <PageWrapper>{content()}</PageWrapper>;
};

export default Vaccination;
