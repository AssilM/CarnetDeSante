import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaArrowLeft, FaDownload } from "react-icons/fa";
import { useDocumentContext } from "../../../context/DocumentContext";
import { httpService } from "../../../services";
import PageWrapper from "../../../components/PageWrapper";

const DocumentDetails = () => {
  const navigate = useNavigate();
  const { selectedItem, clearSelectedItem } = useDocumentContext();
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentType, setDocumentType] = useState(null);

  // Si aucun document n'est sélectionné, rediriger vers la liste
  if (!selectedItem) {
    navigate("/documents");
    return null;
  }

  // Charger le document au montage du composant
  useEffect(() => {
    loadDocument();
  }, [selectedItem.id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📄 Chargement du document pour visualisation:', selectedItem.id);
      
      // Récupérer le document avec les en-têtes d'authentification
      const response = await httpService.get(`/patient/documents/${selectedItem.id}/view`, {
        responseType: 'blob',
      });

      // Récupérer le type MIME
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      setDocumentType(contentType);
      console.log('📄 Type MIME du document:', contentType);

      // Créer un URL blob pour l'affichage
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      setDocumentUrl(blobUrl);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement du document:', error);
      setError('Impossible de charger le document pour la visualisation');
    } finally {
      setLoading(false);
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
    clearSelectedItem();
    navigate(-1);
  };

  const handleDownload = async () => {
    try {
      console.log('📥 Téléchargement du document:', selectedItem);
      
      // Faire l'appel avec les en-têtes d'authentification
      const response = await httpService.get(`/patient/documents/${selectedItem.id}/download`, {
        responseType: 'blob',
      });

      // Récupérer le nom de fichier depuis les en-têtes Content-Disposition si disponible
      let fileName = selectedItem.originalFileName;
      
      if (!fileName) {
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (fileNameMatch) {
            fileName = fileNameMatch[1];
          }
        }
      }
      
      // Si toujours pas de nom de fichier, utiliser un nom par défaut
      if (!fileName) {
        const extension = documentType?.includes('pdf') ? '.pdf' 
          : documentType?.includes('image/jpeg') ? '.jpg'
          : documentType?.includes('image/png') ? '.png'
          : documentType?.includes('image') ? '.jpg'
          : '.pdf';
        fileName = `${selectedItem.name}${extension}`;
      }

      // Créer un lien de téléchargement
      const blob = new Blob([response.data], { type: documentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Téléchargement initié');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du document');
    }
  };

  // Fonction pour rendre le contenu du document selon son type
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
            <button 
              onClick={loadDocument}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    if (!documentUrl || !documentType) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Document non disponible</p>
          </div>
        </div>
      );
    }

    // Rendu selon le type de document
    if (documentType.includes('pdf')) {
      return (
        <div className="w-full h-screen max-h-[80vh]">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0 rounded-lg"
            title={`Document: ${selectedItem.name}`}
          >
            <p>
              Votre navigateur ne supporte pas l'affichage des PDF. 
              <button onClick={handleDownload} className="text-blue-600 underline ml-2">
                Télécharger le document
              </button>
            </p>
          </iframe>
        </div>
      );
    }

    if (documentType.includes('image/')) {
      return (
        <div className="flex justify-center">
          <img
            src={documentUrl}
            alt={selectedItem.name}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-sm"
            onError={() => setError('Impossible de charger l\'image')}
          />
        </div>
      );
    }

    // Pour les autres types de fichiers
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

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour et téléchargement */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </button>
          
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaDownload className="mr-2" />
            Télécharger
          </button>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* En-tête de la carte */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaFileAlt className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedItem.name}
                </h1>
                <p className="text-gray-500">{selectedItem.date}</p>
              </div>
            </div>
          </div>

          {/* Informations du document */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Type de document
                </h2>
                <p className="text-gray-900">{selectedItem.type}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Émis par
                </h2>
                <p className="text-gray-900">{selectedItem.issuedBy}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Date
                </h2>
                <p className="text-gray-900">{selectedItem.date}</p>
              </div>

              {selectedItem.description && (
                <div className="md:col-span-3">
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h2>
                  <p className="text-gray-900">{selectedItem.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Aperçu du document */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Aperçu du document</h2>
            {renderDocumentContent()}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DocumentDetails;
