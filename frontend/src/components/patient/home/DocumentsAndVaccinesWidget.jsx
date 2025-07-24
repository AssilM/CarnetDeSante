import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import { FaSyringe } from "react-icons/fa";
import { useDocumentContext, useVaccinationContext, useAuth } from "../../../context";
import { httpService } from '../../../services/http';
import createDocumentService from '../../../services/api/documentService';

const documentService = createDocumentService(httpService);

const DocumentItem = ({
  id,
  title,
  name,
  date,
  onDocumentClick,
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
  onVaccineClick,
}) => {
  // Fonction pour formater la date correctement
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Si la date est déjà au format français (DD/MM/YYYY), on la retourne telle quelle
    if (dateString.includes("/")) {
      return dateString;
    }
    
    // Sinon, on la formate depuis ISO string ou autre format
    try {
      const date = new Date(dateString);
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return dateString; // Retourner la chaîne originale si la date est invalide
      }
      return date.toLocaleDateString("fr-FR");
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return dateString;
    }
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
          <span className="text-sm text-gray-500">{formatDate(date)}</span>
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
      </div>
    </div>
  );
};

const DocumentsAndVaccinesWidget = () => {
  const [activeSection, setActiveSection] = useState("documents");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Contextes
  const {
    items: documents,
    getRecentItems,
    selectItem: selectDocument,
    setItems: setDocuments,
  } = useDocumentContext();

  const {
    items: vaccines,
    selectItem: selectVaccine,
    fetchVaccines,
  } = useVaccinationContext();

  const { currentUser } = useAuth();

  // Fonction pour charger les documents depuis l'API
  const loadDocuments = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.getMyDocuments();
      if (response.success) {
        const documentsFormatted = response.documents.map((doc) => ({
          id: doc.id,
          name: doc.titre,
          date: new Date(doc.date_creation).toLocaleDateString("fr-FR"),
          type: doc.type_document,
          description: doc.description,
          issuedBy: doc.medecin_nom
            ? `Dr. ${doc.medecin_nom} ${doc.medecin_prenom}`
            : "Auto-ajouté",
          subtitle: doc.type_document,
          url: `/api/documents/${doc.id}/download`,
          originalFileName: doc.nom_fichier,
        }));
        setDocuments(documentsFormatted);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error);
      setError("Erreur lors du chargement des documents");
    } finally {
      setLoading(false);
    }
  };

  // Initialisation des données
  useEffect(() => {
    if (currentUser) {
      if (documents.length === 0) {
        loadDocuments();
      }
      fetchVaccines();
    }
  }, [currentUser, documents.length, fetchVaccines]);

  // Obtenir les éléments récents
  const recentDocuments = getRecentItems(3);
  const recentVaccines = vaccines.slice(0, 3);

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
            <div className="mb-4">
              <h3 className="text-sm font-medium text-blue-600">
                Les plus récents
              </h3>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Chargement des documents...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-500 text-sm mb-2">{error}</p>
                  <button
                    onClick={loadDocuments}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Réessayer
                  </button>
                </div>
              ) : recentDocuments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucun document récent
                </div>
              ) : (
                recentDocuments.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    id={doc.id}
                    title={doc.name || doc.title}
                    name={doc.issuedBy || doc.name}
                    date={doc.date}
                    onDocumentClick={handleDocumentClick}
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
            <div className="mb-4">
              <h3 className="text-sm font-medium text-purple-600">
                Les plus récents
              </h3>
            </div>
            <div className="space-y-3">
              {recentVaccines.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucun vaccin récent
                </div>
              ) : (
                recentVaccines.map((vaccine) => (
                  <VaccineItem
                    key={vaccine.id}
                    id={vaccine.id}
                    name={vaccine.name}
                    date={vaccine.date}
                    doctor={vaccine.doctor}
                    status={vaccine.status}
                    onVaccineClick={handleVaccineClick}
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