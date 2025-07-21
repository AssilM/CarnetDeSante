import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaFileAlt,
  FaArrowLeft,
  FaDownload,
  FaUser,
  FaUserMd,
  FaCalendar,
  FaTrash,
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import {
  getDocumentById,
  deleteDocument,
} from "../../services/api/adminService";
import { httpService } from "../../services";
import PageWrapper from "../../components/PageWrapper";

const DocumentDetails = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;

      try {
        setLoading(true);
        setError(null);

        const doc = await getDocumentById(documentId);
        setDocData(doc);

        // Charger le document pour visualisation
        await loadDocumentForView(doc);
      } catch (error) {
        console.error("Erreur lors du chargement du document:", error);
        if (error.response?.status === 404) {
          setError("Document non trouvé");
        } else {
          setError("Erreur lors du chargement du document");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const loadDocumentForView = async (doc) => {
    try {
      const response = await httpService.get(
        `/admin/documents/${doc.id}/download`,
        {
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      setDocumentType(contentType);

      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      setDocumentUrl(blobUrl);
    } catch (error) {
      console.error(
        "Erreur lors du chargement du document pour visualisation:",
        error
      );
      setError("Impossible de charger le document pour la visualisation");
    }
  };

  // Nettoyer l'URL blob au démontage
  useEffect(() => {
    return () => {
      if (documentUrl) {
        window.URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = async () => {
    if (!docData) return;

    try {
      setNotification({ type: "info", message: "Téléchargement en cours..." });

      const response = await httpService.get(
        `/admin/documents/${docData.id}/download`,
        {
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      let fileName = docData.nom_fichier || docData.titre;

      if (!fileName) {
        const extension = contentType.includes("pdf") ? ".pdf" : ".pdf";
        fileName = `${docData.titre || "document"}${extension}`;
      }

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setNotification({
        type: "success",
        message: "Document téléchargé avec succès !",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      setNotification({
        type: "error",
        message: "Erreur lors du téléchargement du document",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDelete = async () => {
    if (
      !docData ||
      !window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")
    ) {
      return;
    }

    try {
      setNotification({ type: "info", message: "Suppression en cours..." });
      await deleteDocument(docData.id);
      setNotification({
        type: "success",
        message: "Document supprimé avec succès !",
      });
      setTimeout(() => {
        setNotification(null);
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setNotification({
        type: "error",
        message: "Erreur lors de la suppression du document",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderDocumentContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <FaFileAlt className="text-6xl mx-auto mb-2" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      );
    }

    if (!documentUrl || !documentType) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Document non disponible</p>
          </div>
        </div>
      );
    }

    if (documentType.includes("pdf")) {
      return (
        <div className="w-full h-[70vh]">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0"
            title={`Document: ${docData?.titre}`}
          >
            <p>
              Votre navigateur ne supporte pas l'affichage des PDF.
              <button
                onClick={handleDownload}
                className="text-blue-600 underline ml-2"
              >
                Télécharger le document
              </button>
            </p>
          </iframe>
        </div>
      );
    }

    if (documentType.includes("image/")) {
      return (
        <div className="flex justify-center">
          <img
            src={documentUrl}
            alt={docData?.titre}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-sm"
            onError={() => setError("Impossible de charger l'image")}
          />
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Aperçu non disponible pour ce type de fichier
          </p>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <FaDownload className="mr-2" />
            Télécharger le document
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error && !docData) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Retour
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!docData) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-gray-600 text-xl mb-4">
              Document non trouvé
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Retour
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center text-base font-medium ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
            style={{ minWidth: 200, maxWidth: 320 }}
          >
            {notification.message}
          </div>
        )}
        {/* En-tête avec boutons d'action */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-2 sm:gap-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 text-sm px-2 py-1"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm justify-center"
            >
              <FaDownload className="mr-2" />
              Télécharger
            </button>
            <button
              onClick={handleDelete}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm justify-center"
            >
              <FaTrash className="mr-2" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* En-tête de la carte */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaFileAlt className="text-xl sm:text-2xl text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 break-words max-w-full">
                  {docData.titre || "Document sans nom"}
                </h1>
                <p className="text-gray-500 text-xs sm:text-base">
                  {formatDate(docData.date_creation)}
                </p>
              </div>
            </div>
          </div>

          {/* Informations du document */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Type de document
                </h2>
                <p className="text-gray-900 text-sm sm:text-base">
                  {docData.type_document_label || "Non spécifié"}
                </p>
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Patient
                </h2>
                <p className="text-gray-900 text-sm sm:text-base">
                  {docData.patient_nom} {docData.patient_prenom}
                </p>
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Date de création
                </h2>
                <p className="text-gray-900 text-sm sm:text-base">
                  {formatDate(docData.date_creation)}
                </p>
              </div>
              {docData.medecin_nom && (
                <div>
                  <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    Médecin
                  </h2>
                  <p className="text-gray-900 text-sm sm:text-base">
                    {docData.medecin_nom} {docData.medecin_prenom}
                  </p>
                </div>
              )}
              {docData.uploader_nom && (
                <div>
                  <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    Uploadé par
                  </h2>
                  <p className="text-gray-900 text-sm sm:text-base">
                    {docData.uploader_nom} {docData.uploader_prenom}
                  </p>
                </div>
              )}
              {docData.taille_fichier && (
                <div>
                  <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    Taille
                  </h2>
                  <p className="text-gray-900 text-sm sm:text-base">
                    {(docData.taille_fichier / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              {docData.description && (
                <div className="md:col-span-3">
                  <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h2>
                  <p className="text-gray-900 text-sm sm:text-base">
                    {docData.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Aperçu du document */}
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
              Aperçu du document
            </h2>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-full sm:max-w-2xl rounded-lg border border-gray-100 bg-gray-50 p-2 sm:p-4">
                {renderDocumentContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DocumentDetails;
