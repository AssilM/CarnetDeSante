import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList, ActionButton } from "../../../components/patient/common";
import AddDocumentForm from "../../../components/patient/documents/AddDocumentForm";
import { useFormModal } from "../../../hooks";

const Documents = () => {
  const navigate = useNavigate();
  const { selectItem, setItems, items, addItem } = useDocumentContext();

  // Utilisation du hook personnalisé pour gérer le formulaire d'ajout
  const {
    isOpen: showAddForm,
    openForm,
    closeForm,
    handleSubmit,
  } = useFormModal((data) => {
    // Génération d'un ID unique pour le nouveau document
    const newDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      date: new Date().toLocaleDateString("fr-FR"),
    };

    // Ajout du document via le contexte
    addItem(newDocument);
    console.log("Nouveau document:", newDocument);
  });

  // Initialisation des données de test
  useEffect(() => {
    if (items.length === 0) {
      setItems([
        {
          id: "1",
          name: "Ordonnance pour allergie",
          date: "15/01/2024",
          type: "Ordonnance",
          issuedBy: "Dr. Martin",
          subtitle: "Traitement antihistaminique",
          description:
            "Ordonnance pour le traitement des allergies saisonnières",
          url: "#",
        },
        {
          id: "2",
          name: "Résultats analyse sang",
          date: "01/12/2023",
          type: "Analyse",
          issuedBy: "Laboratoire Central",
          subtitle: "Bilan sanguin complet",
          description: "Résultats du bilan sanguin annuel",
          url: "#",
        },
        {
          id: "3",
          name: "Compte rendu radiologie",
          date: "20/11/2023",
          type: "Imagerie",
          issuedBy: "Centre d'Imagerie Médicale",
          subtitle: "Radio thorax",
          description: "Compte rendu de la radiographie thoracique",
          url: "#",
        },
        // Les autres documents...
      ]);
    }
  }, [setItems, items.length]);

  const handleViewDetails = (document) => {
    selectItem(document);
    navigate("/documents/details");
  };

  const handleGenerateReport = () => {
    console.log("Générer le récapitulatif des documents");
  };

  const content = () => {
    if (showAddForm) {
      return (
        <div className="mt-10">
          <AddDocumentForm onSubmit={handleSubmit} onCancel={closeForm} />
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
        type="document"
        title="Documents"
        description="Retrouvez et ajoutez vos documents médicaux"
        onAdd={openForm}
        onViewDetails={handleViewDetails}
        addButtonText="Ajouter un document"
        rightAction={generateReportButton}
      />
    );
  };

  return <PageWrapper>{content()}</PageWrapper>;
};

export default Documents;
