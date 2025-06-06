import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiDownload } from "react-icons/hi";

const DocumentItem = ({ id, title, name, date, onDocumentClick }) => {
  const handleDownload = (e) => {
    e.stopPropagation(); // Empêche le déclenchement du onClick du parent
    // La logique de téléchargement sera implémentée plus tard
    console.log("Téléchargement du document:", id);
  };

  return (
    <div
      className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
      onClick={() => onDocumentClick(id)}
    >
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
        📄
      </div>
      <div className="flex-grow">
        <h4 className="font-medium">{title}</h4>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">{name}</p>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="p-2 rounded-full hover:bg-blue-200 transition-colors text-blue-600"
        title="Télécharger le document"
      >
        <HiDownload className="text-xl" />
      </button>
    </div>
  );
};

const DocumentsList = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const navigate = useNavigate();

  // Simulation de données locales - À remplacer par des appels API plus tard
  const recentDocuments = [
    {
      id: "doc1",
      title: "Résultats analyse sanguin",
      name: "Dr. Martin",
      date: "15/03/2024",
    },
    {
      id: "doc2",
      title: "Ordonnance antibiotiques",
      name: "Dr. Dubois",
      date: "10/03/2024",
    },
    {
      id: "doc3",
      title: "Radio du genou",
      name: "Dr. Bernard",
      date: "05/03/2024",
    },
  ];

  const pinnedDocuments = [
    {
      id: "doc4",
      title: "Carnet de vaccination",
      name: "Dr. Laurent",
      date: "01/01/2024",
    },
    {
      id: "doc5",
      title: "Bilan annuel",
      name: "Dr. Martin",
      date: "15/12/2023",
    },
  ];

  const handleDocumentClick = (documentId) => {
    // Pour l'instant, on navigue vers une route temporaire
    // Plus tard, cette logique sera remplacée par l'ouverture du document via l'API
    navigate(`/documents/${documentId}`);
  };

  const currentDocuments =
    activeTab === "recent" ? recentDocuments : pinnedDocuments;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Mes documents</h2>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`text-sm font-medium ${
            activeTab === "recent"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("recent")}
        >
          Les plus récents
        </button>
        <button
          className={`text-sm font-medium ${
            activeTab === "pinned"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("pinned")}
        >
          Épinglés
        </button>
      </div>

      <div className="space-y-3">
        {currentDocuments.map((doc) => (
          <DocumentItem
            key={doc.id}
            {...doc}
            onDocumentClick={handleDocumentClick}
          />
        ))}
      </div>

      <button className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-800">
        Cliquez ici pour retrouver tous vos documents
      </button>
    </div>
  );
};

export default DocumentsList;
