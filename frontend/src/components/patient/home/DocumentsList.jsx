import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import { FaThumbtack } from "react-icons/fa";
import { useDocumentContext } from "../../../context";
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
      // Appel API pour récupérer le document en blob
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
    e.stopPropagation(); // Empêche le déclenchement du onClick du parent
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

const DocumentsList = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const navigate = useNavigate();
  const {
    items,
    togglePinned,
    getRecentItems,
    getPinnedItems,
    selectItem,
    setItems,
  } = useDocumentContext();

  // Initialisation des données de test
  useEffect(() => {
    if (items.length === 0) {
      setItems([
        
      ]);
    }
  }, [setItems, items.length]);

  // Obtenir les 5 documents les plus récents
  const recentDocuments = getRecentItems(3);
  const pinnedDocuments = getPinnedItems();

  const handleDocumentClick = (documentId) => {
    const document = items.find((doc) => doc.id === documentId);
    if (document) {
      selectItem(document);
      navigate("/documents/details");
    }
  };

  const handleTogglePin = (id) => {
    togglePinned(id);
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
              onTogglePin={handleTogglePin}
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
  );
};

export default DocumentsList;
