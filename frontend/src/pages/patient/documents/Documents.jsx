import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentContext, useAuth } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList, ActionButton } from "../../../components/patient/common";
import AddDocumentForm from "../../../components/patient/documents/AddDocumentForm";
import { useFormModal } from "../../../hooks";
import { httpService } from "../../../services";

const Documents = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { selectItem, setItems, items, togglePinned } = useDocumentContext();
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
      console.log("📤 Soumission du formulaire:", formData);
      console.log("👤 Utilisateur connecté:", currentUser);

      // Créer un FormData pour l'upload de fichier
      const data = new FormData();
      data.append("titre", formData.titre);
      data.append("type_document", formData.type_document);
      data.append("date_creation", formData.date_creation);
      data.append("description", formData.description || "");
      data.append("document", formData.file); // Le fichier

      // Ajouter le patient_id (utilisateur connecté)
      // Essayons différentes propriétés de currentUser
      const patientId =
        currentUser?.id || currentUser?.userId || currentUser?.user_id;
      console.log("🔍 Patient ID trouvé:", patientId);

      if (patientId) {
        data.append("patient_id", patientId.toString());
      } else {
        console.error(
          "❌ Aucun patient_id trouvé dans currentUser:",
          currentUser
        );
        throw new Error("Utilisateur non identifié");
      }

      console.log("📤 Données à envoyer:", {
        titre: formData.titre,
        type_document: formData.type_document,
        date_creation: formData.date_creation,
        description: formData.description,
        patient_id: patientId,
        file: formData.file?.name,
      });

      // Appel API
      const response = await httpService.post("/patient/documents", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Réponse API:", response.data);

      // Afficher la notification de succès
      if (response.data.notification) {
        showNotification(response.data.notification);
      }

      // Recharger la liste des documents
      await loadDocuments();
      closeForm();
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du document:", error);

      // Afficher la notification d'erreur
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
      if (!currentUser?.id) {
        console.log("👤 Utilisateur non chargé, attente...");
        return;
      }

      console.log("📥 Chargement des documents depuis l'API...");
      const response = await httpService.get(
        `/patient/${currentUser.id}/documents`
      );

      console.log("📄 Réponse brute de l'API:", response.data);

      if (response.data.success) {
        // Convertir les documents de l'API au format attendu par le contexte
        const documentsFormatted = response.data.documents.map((doc) => ({
          id: doc.id,
          name: doc.titre,
          date: new Date(doc.date_creation).toLocaleDateString("fr-FR"),
          type: doc.type_document,
          description: doc.description,
          issuedBy: doc.medecin_nom
            ? `Dr. ${doc.medecin_nom} ${doc.medecin_prenom}`
            : "Auto-ajouté",
          subtitle: doc.type_document,
          url: `/api/patient/documents/${doc.id}/download`, // URL de téléchargement
          originalFileName: doc.nom_fichier, // Nom de fichier original avec extension
          pinned: false, // TODO: implémenter la fonctionnalité d'épinglage
        }));

        console.log("✅ Documents chargés:", documentsFormatted);
        setItems(documentsFormatted);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des documents:", error);
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

  const handleTogglePin = (id) => {
    togglePinned(id);
  };

  const content = () => {
    if (showAddForm) {
      return (
        <div className="mt-10">
          <AddDocumentForm onSubmit={handleSubmit} onCancel={closeForm} />
        </div>
      );
    }

    return (
      <ItemsList
        items={items}
        type="document"
        title="Documents"
        description="Retrouvez et ajoutez vos documents médicaux"
        onAdd={openForm}
        onViewDetails={handleViewDetails}
        onTogglePin={handleTogglePin}
        addButtonText="Ajouter un document"
      />
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

      {/* Contenu principal - affiché uniquement si l'utilisateur est chargé */}
      {!authLoading && currentUser && (
        <>
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

          {content()}
        </>
      )}
    </PageWrapper>
  );
};

export default Documents;
