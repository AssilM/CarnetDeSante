import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import { FaThumbtack, FaSyringe } from "react-icons/fa";
import { useDocumentContext, useVaccinationContext } from "../../../context";
import { httpService } from '../../../services/http';

const DocumentItem = ({
  id,
  title,
  name,
  date,
  pinned,
  onDocumentClick,
  onTogglePin,
}) => {
  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await httpService.get(`/documents/${id}/download`, {
        responseType: 'blob',
      });
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      let fileName = title || `document-${id}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) fileName = match[1];
      }
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors du téléchargement du document');
      console.error('Erreur téléchargement document:', error);
    }
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    onTogglePin(id);
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
      <div className="flex items-center">
        <button
          onClick={handleTogglePin}
          className={`p-2 rounded-full ${
            pinned
              ? "text-amber-500 hover:text-amber-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
          title={pinned ? "Désépingler" : "Épingler"}
        >
          <FaThumbtack
            className={`text-lg ${pinned ? "rotate-0" : "rotate-45"}`}
          />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 rounded-full hover:bg-blue-200 transition-colors text-blue-600"
          title="Télécharger le document"
        >
          <HiDownload className="text-xl" />
        </button>
      </div>
    </div>
  );
};

const VaccineItem = ({
  id,
  name,
  date,
  doctor,
  status,
  pinned,
  onVaccineClick,
  onTogglePin,
}) => {
  const handleTogglePin = (e) => {
    e.stopPropagation();
    onTogglePin(id);
  };

  return (
    <div
      className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
      onClick={() => onVaccineClick(id)}
    >
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
        <FaSyringe className="text-purple-600 text-xl" />
      </div>
      <div className="flex-grow">
        <h4 className="font-medium">{name}</h4>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">{doctor || "Non renseigné"}</p>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "effectué" 
            ? "bg-green-100 text-green-800" 
            : "bg-orange-100 text-orange-800"
        }`}>
          {status === "effectué" ? "Effectué" : "À faire"}
        </span>
        <button
          onClick={handleTogglePin}
          className={`p-2 rounded-full ${
            pinned
              ? "text-amber-500 hover:text-amber-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
          title={pinned ? "Désépingler" : "Épingler"}
        >
          <FaThumbtack
            className={`text-lg ${pinned ? "rotate-0" : "rotate-45"}`}
          />
        </button>
      </div>
    </div>
  );
};

const DocumentsAndVaccinesWidget = () => {
  const [activeSection, setActiveSection] = useState("documents");
  const [activeTab, setActiveTab] = useState("recent");
  const navigate = useNavigate();
  
  // Contextes
  const {
    items: documents,
    togglePinned: toggleDocumentPin,
    getRecentItems,
    getPinnedItems,
    selectItem: selectDocument,
    setItems: setDocuments,
  } = useDocumentContext();

  const {
    items: vaccines,
    togglePinned: toggleVaccinePin,
    selectItem: selectVaccine,
    fetchVaccines,
  } = useVaccinationContext();

  // Initialisation des données
  useEffect(() => {
    if (documents.length === 0) {
      setDocuments([]);
    }
    fetchVaccines();
  }, [setDocuments, fetchVaccines]);

  // Obtenir les éléments récents
  const recentDocuments = getRecentItems(3);
  const pinnedDocuments = getPinnedItems();
  const recentVaccines = vaccines.slice(0, 3);
  const pinnedVaccines = vaccines.filter(v => v.pinned);

  const handleDocumentClick = (documentId) => {
    const document = documents.find((doc) => doc.id === documentId);
    if (document) {
      selectDocument(document);
      navigate("/documents/details");
    }
  };

  const handleVaccineClick = (vaccineId) => {
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    if (vaccine) {
      selectVaccine(vaccine);
      navigate("/vaccination/details");
    }
  };

  const handleToggleDocumentPin = (id) => {
    toggleDocumentPin(id);
  };

  const handleToggleVaccinePin = (id) => {
    toggleVaccinePin(id);
  };

  const currentDocuments = activeTab === "recent" ? recentDocuments : pinnedDocuments;
  const currentVaccines = activeTab === "recent" ? recentVaccines : pinnedVaccines;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header avec slider style Samsung */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Mes données</h2>
        </div>
        
        {/* Slider style Samsung */}
        <div className="bg-white/20 rounded-full p-1">
          <div className="flex">
            <button
              onClick={() => setActiveSection("documents")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                activeSection === "documents"
                  ? "bg-white text-blue-600 shadow-lg transform scale-105"
                  : "text-white hover:text-blue-100"
              }`}
            >
              📄 Documents
            </button>
            <button
              onClick={() => setActiveSection("vaccines")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                activeSection === "vaccines"
                  ? "bg-white text-purple-600 shadow-lg transform scale-105"
                  : "text-white hover:text-purple-100"
              }`}
            >
              💉 Vaccins
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeSection === "documents" ? (
          // Section Documents
          <div>
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
              {currentDocuments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {activeTab === "pinned"
                    ? "Aucun document épinglé"
                    : "Aucun document récent"}
                </div>
              ) : (
                currentDocuments.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    id={doc.id}
                    title={doc.name || doc.title}
                    name={doc.issuedBy || doc.name}
                    date={doc.date}
                    pinned={doc.pinned}
                    onDocumentClick={handleDocumentClick}
                    onTogglePin={handleToggleDocumentPin}
                  />
                ))
              )}
            </div>

            <button
              onClick={() => navigate("/documents")}
              className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-800"
            >
              Cliquez ici pour retrouver tous vos documents
            </button>
          </div>
        ) : (
          // Section Vaccins
          <div>
            <div className="flex gap-4 mb-4">
              <button
                className={`text-sm font-medium ${
                  activeTab === "recent"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("recent")}
              >
                Les plus récents
              </button>
              <button
                className={`text-sm font-medium ${
                  activeTab === "pinned"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("pinned")}
              >
                Épinglés
              </button>
            </div>

            <div className="space-y-3">
              {currentVaccines.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {activeTab === "pinned"
                    ? "Aucun vaccin épinglé"
                    : "Aucun vaccin récent"}
                </div>
              ) : (
                currentVaccines.map((vaccine) => (
                  <VaccineItem
                    key={vaccine.id}
                    id={vaccine.id}
                    name={vaccine.name}
                    date={vaccine.date}
                    doctor={vaccine.doctor}
                    status={vaccine.status}
                    pinned={vaccine.pinned}
                    onVaccineClick={handleVaccineClick}
                    onTogglePin={handleToggleVaccinePin}
                  />
                ))
              )}
            </div>

            <button
              onClick={() => navigate("/vaccination")}
              className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-800"
            >
              Cliquez ici pour retrouver tous vos vaccins
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsAndVaccinesWidget; 