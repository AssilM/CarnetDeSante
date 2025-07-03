import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import { FaThumbtack, FaSyringe } from "react-icons/fa";
import { useDocumentContext } from "../../../context";
import { useAuth } from "../../../context/AuthContext";
import { createDocumentService } from "../../../services/api";
import { httpService } from "../../../services/http";
import { vaccinService } from "../../../services/api/vaccinService";

const VaccineItem = ({ vaccine, onVaccineClick }) => {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
      onClick={() => onVaccineClick(vaccine.id)}
    >
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
        <FaSyringe className="text-purple-600" />
      </div>
      <div className="flex-grow">
        <h4 className="font-medium">{vaccine.nom_vaccin}</h4>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {vaccine.nom_medecin ? `Dr. ${vaccine.nom_medecin}` : 'Médecin non spécifié'}
          </p>
          <span className="text-sm text-gray-500">
            {new Date(vaccine.date_vaccination).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          vaccine.statut === 'administré' || !vaccine.statut ? 
            'bg-green-100 text-green-800' :
          vaccine.statut === 'planifié' ? 
            'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
        }`}> 
          {vaccine.statut || 'Administré'}
        </span>
      </div>
    </div>
  );
};

const DocumentItem = ({
  id,
  title,
  name,
  date,
  pinned,
  onDocumentClick,
  onTogglePin,
  onDownload,
}) => {
  const handleDownload = (e) => {
    e.stopPropagation(); // Empêche le déclenchement du onClick du parent
    if (onDownload) {
      onDownload(id);
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
  const [widgetType, setWidgetType] = useState("documents"); // "documents" ou "vaccines"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    items,
    togglePinned,
    getRecentItems,
    getPinnedItems,
    selectItem,
    setItems,
  } = useDocumentContext();

  // Créer le service de documents avec useMemo pour éviter les re-créations
  const documentService = useMemo(() => createDocumentService(httpService), []);

  // Récupérer les documents depuis l'API
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await documentService.getPatientDocuments(currentUser.id);
        
        if (response.success && response.documents) {
          // Transformer les données de l'API pour correspondre au format attendu par le contexte
          const transformedDocuments = response.documents.map(doc => ({
            id: doc.id.toString(),
            name: doc.nom || doc.titre || 'Document sans nom',
            title: doc.nom || doc.titre || 'Document sans nom',
            date: doc.date_creation ? new Date(doc.date_creation).toLocaleDateString('fr-FR') : 'Date inconnue',
            type: doc.type || 'Document',
            issuedBy: doc.medecin_nom && doc.medecin_prenom 
              ? `Dr. ${doc.medecin_prenom} ${doc.medecin_nom}`
              : 'Médecin inconnu',
            subtitle: doc.description || doc.type || 'Document médical',
            description: doc.description || 'Document médical',
            url: doc.chemin_fichier || '#',
            pinned: doc.epingle || false,
            originalData: doc // Conserver les données originales
          }));
          
          setItems(transformedDocuments);
        } else {
          setItems([]);
        }
      } catch (err) {
        setError('Impossible de charger les documents');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentUser?.id, setItems, documentService]);

  // Récupérer les vaccins depuis l'API
  useEffect(() => {
    const fetchVaccines = async () => {
      if (!currentUser?.id) return;
      
      try {
        const response = await vaccinService.getVaccins(currentUser.id);
        
        if (response && response.success) {
          setVaccines(response.data);
        } else {
          setVaccines([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des vaccins:', err);
        setVaccines([]);
      }
    };

    fetchVaccines();
  }, [currentUser?.id]);

  // Fonction pour télécharger un document
  const handleDownload = async (documentId) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_${documentId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Vous pouvez ajouter une notification d'erreur ici
    }
  };

  const handleDocumentClick = (documentId) => {
    const document = items.find((doc) => doc.id === documentId);
    if (document) {
      selectItem(document);
      navigate(`/patient/documents/${documentId}`);
    }
  };

  const handleTogglePin = (id) => {
    togglePinned(id);
  };

  const handleVaccineClick = (vaccineId) => {
    navigate(`/vaccination`);
  };

  // Obtenir les documents récents et épinglés
  const recentDocuments = getRecentItems(3);
  const pinnedDocuments = getPinnedItems();

  // Obtenir les vaccins récents
  const recentVaccines = vaccines
    .sort((a, b) => new Date(b.date_vaccination) - new Date(a.date_vaccination))
    .slice(0, 3);

  const getUpcomingVaccines = () => {
    const today = new Date();
    return vaccines
      .filter(vaccine => {
        const vaccinationDate = new Date(vaccine.date_vaccination);
        return vaccinationDate > today && vaccine.statut === 'planifié';
      })
      .slice(0, 3);
  };

  const upcomingVaccines = getUpcomingVaccines();

  const currentDocuments =
    activeTab === "recent" ? recentDocuments : pinnedDocuments;

  const currentVaccines =
    activeTab === "recent" ? recentVaccines : upcomingVaccines;

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {widgetType === "documents" ? "Mes documents" : "Mes vaccins"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setWidgetType("documents")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                widgetType === "documents"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📄 Documents
            </button>
            <button
              onClick={() => setWidgetType("vaccines")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                widgetType === "vaccines"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              💉 Vaccins
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher l'erreur si elle existe
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {widgetType === "documents" ? "Mes documents" : "Mes vaccins"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setWidgetType("documents")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                widgetType === "documents"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📄 Documents
            </button>
            <button
              onClick={() => setWidgetType("vaccines")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                widgetType === "vaccines"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              💉 Vaccins
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {widgetType === "documents" ? "Mes documents" : "Mes vaccins"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setWidgetType("documents")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              widgetType === "documents"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📄 Documents
          </button>
          <button
            onClick={() => setWidgetType("vaccines")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              widgetType === "vaccines"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            💉 Vaccins
          </button>
        </div>
      </div>

      {widgetType === "documents" ? (
        <>
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
                  onDownload={handleDownload}
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
        </>
      ) : (
        <>
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
              À venir
            </button>
          </div>

          <div className="space-y-3">
            {currentVaccines.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {activeTab === "pinned"
                  ? "Aucun vaccin planifié"
                  : "Aucun vaccin récent"}
              </div>
            ) : (
              currentVaccines.map((vaccine) => (
                <VaccineItem
                  key={vaccine.id}
                  vaccine={vaccine}
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
        </>
      )}
    </div>
  );
};

export default DocumentsList;
