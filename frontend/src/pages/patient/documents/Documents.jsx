import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt } from "react-icons/fa";
import { useDocumentContext, useAuth } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList, ActionButton } from "../../../components/patient/common";
import AddDocumentForm from "../../../components/patient/documents/AddDocumentForm";
import { useFormModal } from "../../../hooks";
import { httpService } from "../../../services";
import createDocumentService from "../../../services/api/documentService";

const documentService = createDocumentService(httpService);

const Documents = () => {
  // État pour les types de documents et l'index sélectionné
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  useEffect(() => {
    const fetchTypes = async () => {
      const res = await httpService.get("/documents/types");
      if (res.data && res.data.types) {
        setDocumentTypes([
          { id: "all", label: "Tous les documents" },
          ...res.data.types,
        ]);
      }
    };
    fetchTypes();
  }, []);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { selectItem, setItems, items } = useDocumentContext();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fonction pour afficher les notifications
  const showNotification = (notification) => {
    setNotification(notification);
    setTimeout(() => setNotification(null), 5000);
  };

  // Fonction pour soumettre le document
  const submitDocument = async (formData) => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("titre", formData.titre);
      data.append("type_document", formData.type_document);
      data.append("date_creation", formData.date_creation);
      data.append("description", formData.description || "");
      data.append("document", formData.file);
      // patient_id n'est plus nécessaire, le backend l'infère via le token
      const response = await documentService.createDocument(data);
      if (response.notification) showNotification(response.notification);
      await loadDocuments();
      closeForm();
    } catch (error) {
      const errorNotification = error.response?.data?.notification || {
        type: "error",
        title: "Erreur",
        message: "Une erreur est survenue lors de l'ajout du document",
      };
      showNotification(errorNotification);
    } finally {
      setLoading(false);
    }
  };

  // Utilisation du hook personnalisé pour gérer le formulaire d'ajout
  const {
    isOpen: showAddForm,
    openForm,
    closeForm,
    handleSubmit,
  } = useFormModal(submitDocument);

  // Fonction pour charger les documents depuis l'API
  const loadDocuments = async () => {
    try {
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
        setItems(documentsFormatted);
      }
    } catch {
      showNotification({
        type: "error",
        title: "Erreur de chargement",
        message: "Impossible de charger vos documents",
      });
    }
  };

  // Initialisation des données depuis l'API
  useEffect(() => {
    if (!authLoading && currentUser && items.length === 0) {
      loadDocuments();
    }
  }, [authLoading, currentUser, items.length]);

  const handleViewDetails = (document) => {
    selectItem(document);
    navigate(`/documents/${document.id}`);
  };

  const content = () => {
    if (showAddForm) {
      return (
        <div className="mt-10">
          <AddDocumentForm onSubmit={handleSubmit} onCancel={closeForm} />
        </div>
      );
    }

    // Filtrer les documents selon le type sélectionné
    const selectedType = documentTypes[selectedTypeIndex]?.label;
    const filteredItems =
      selectedType && selectedType !== "Tous les documents"
        ? items.filter((doc) => doc.type === selectedType)
        : items;

    return (
      <>
        {/* En-tête de la page avec icône et titre */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <FaFileAlt className="text-2xl text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Mes documents
                  </h1>
                  <p className="text-sm text-gray-600">
                    Retrouvez et gérez tous vos documents médicaux
                  </p>
                </div>
              </div>
              <button
                onClick={openForm}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter un document
              </button>
            </div>
          </div>
        </div>

        {/* Barre de navigation entre les types de documents */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex justify-center">
              <div className="flex w-full sm:w-auto justify-between sm:justify-center sm:space-x-8 md:space-x-12">
                {documentTypes.map((type, idx) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTypeIndex(idx)}
                    className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap transition-colors ${
                      selectedTypeIndex === idx
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Liste des documents */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ItemsList
            items={filteredItems}
            type="document"
            onViewDetails={handleViewDetails}
            showPinnedSection={false}
          />
        </div>
      </>
    );
  };

  return (
    <PageWrapper>
      {/* Vérification de l'état de chargement de l'authentification */}
      {authLoading && (
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos informations...</p>
          </div>
        </div>
      )}

      {/* Vérification de la présence de l'utilisateur */}
      {!authLoading && !currentUser && (
        <div className="text-center py-8">
          <p className="text-red-600">Erreur : utilisateur non connecté</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      )}

      {!authLoading && currentUser && (
        <>
          {content()}
          {/* Notification */}
          {notification && (
            <div
              className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
                notification.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {notification.type === "success" ? (
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      notification.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p
                    className={`text-sm ${
                      notification.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Loading overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3">Ajout du document en cours...</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default Documents;
