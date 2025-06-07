import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentContext } from "../../../context/DocumentContext";
import PageWrapper from "../../../components/PageWrapper";
import ItemsList from "../../../components/common/ItemsList";
import AddDocumentForm from "../../../components/patient/documents/AddDocumentForm";

const Documents = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const { setSelectedDocument } = useDocumentContext();

  // Données de test
  const documents = [
    {
      name: "Ordonnance pour allergie",
      date: "15/01/2024",
      type: "Ordonnance",
      issuedBy: "Dr. Martin",
      subtitle: "Traitement antihistaminique",
      description: "Ordonnance pour le traitement des allergies saisonnières",
      url: "#",
    },
    {
      name: "Résultats analyse sang",
      date: "01/12/2023",
      type: "Analyse",
      issuedBy: "Laboratoire Central",
      subtitle: "Bilan sanguin complet",
      description: "Résultats du bilan sanguin annuel",
      url: "#",
    },
    {
      name: "Compte rendu radiologie",
      date: "20/11/2023",
      type: "Imagerie",
      issuedBy: "Centre d'Imagerie Médicale",
      subtitle: "Radio thorax",
      description: "Compte rendu de la radiographie thoracique",
      url: "#",
    },
    {
      name: "Compte rendu radiologie",
      date: "20/11/2023",
      type: "Imagerie",
      issuedBy: "Centre d'Imagerie Médicale",
      subtitle: "Radio thorax",
      description: "Compte rendu de la radiographie thoracique",
      url: "#",
    },
    {
      name: "Compte rendu radiologie",
      date: "20/11/2023",
      type: "Imagerie",
      issuedBy: "Centre d'Imagerie Médicale",
      subtitle: "Radio thorax",
      description: "Compte rendu de la radiographie thoracique",
      url: "#",
    },
    {
      name: "Compte rendu radiologie",
      date: "20/11/2023",
      type: "Imagerie",
      issuedBy: "Centre d'Imagerie Médicale",
      subtitle: "Radio thorax",
      description: "Compte rendu de la radiographie thoracique",
      url: "#",
    },
    {
      name: "Compte rendu radiologie",
      date: "20/11/2023",
      type: "Imagerie",
      issuedBy: "Centre d'Imagerie Médicale",
      subtitle: "Radio thorax",
      description: "Compte rendu de la radiographie thoracique",
      url: "#",
    },
  ];

  const handleAddDocument = (data) => {
    console.log("Nouveau document:", data);
    setShowAddForm(false);
  };

  const handleViewDetails = (document) => {
    setSelectedDocument(document);
    navigate("/documents/details");
  };

  const handleGenerateReport = () => {
    console.log("Générer le récapitulatif des documents");
  };

  const content = () => {
    if (showAddForm) {
      return (
        <div className="mt-10">
          <AddDocumentForm
            onSubmit={handleAddDocument}
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
        items={documents}
        type="document"
        title="Documents"
        description="Retrouvez et ajoutez vos documents médicaux"
        onAdd={() => setShowAddForm(true)}
        onViewDetails={handleViewDetails}
        addButtonText="Ajouter un document"
        rightAction={generateReportButton}
      />
    );
  };

  return <PageWrapper>{content()}</PageWrapper>;
};

export default Documents;
