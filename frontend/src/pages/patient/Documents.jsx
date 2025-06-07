import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import ItemsList from "../../components/common/ItemsList";
import AddDocumentForm from "../../components/patient/documents/AddDocumentForm";
import DocumentDetails from "../../components/patient/documents/DocumentDetails";

const Documents = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Données de test
  const documents = [
    {
      title: "Radiographie du genou",
      date: "01/01/2024",
      type: "Radiographie",
      subtitle: "Dr. Martin - Hôpital Central",
      description: "Radiographie suite à une blessure au sport",
      fileUrl: "#",
    },
    {
      title: "Ordonnance antibiotiques",
      date: "15/12/2023",
      type: "Ordonnance",
      subtitle: "Dr. Dupont - Cabinet médical",
      description: "Traitement pour infection ORL",
      fileUrl: "#",
    },
    {
      title: "Résultats analyse sang",
      date: "05/12/2023",
      type: "Analyse",
      subtitle: "Laboratoire Medical",
      description: "Bilan sanguin annuel",
      fileUrl: "#",
    },
  ];

  const handleAddDocument = (data) => {
    console.log("Nouveau document:", data);
    setShowAddForm(false);
  };

  const handleViewDetails = (document) => {
    setSelectedDocument(document);
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

    if (selectedDocument) {
      return (
        <div className="mt-10">
          <DocumentDetails
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        </div>
      );
    }

    return (
      <ItemsList
        items={documents}
        type="document"
        title="Mes documents"
        description="Retrouver et ajouter vos documents médicaux"
        onAdd={() => setShowAddForm(true)}
        onViewDetails={handleViewDetails}
        addButtonText="Ajouter un document"
      />
    );
  };

  return <PageWrapper>{content()}</PageWrapper>;
};

export default Documents;
