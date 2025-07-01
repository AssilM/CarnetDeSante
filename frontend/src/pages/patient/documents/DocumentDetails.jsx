import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { useDocumentContext } from "../../../context/DocumentContext";
import { httpService } from "../../../services";
import PageWrapper from "../../../components/PageWrapper";

const DocumentDetails = () => {
  const navigate = useNavigate();
  const { selectedItem, clearSelectedItem } = useDocumentContext();

  // Si aucun document n'est sélectionné, rediriger vers la liste
  if (!selectedItem) {
    navigate("/documents");
    return null;
  }

  const handleBack = () => {
    clearSelectedItem();
    navigate(-1);
  };

  const handleDownload = async () => {
    try {
      console.log('📥 Téléchargement du document:', selectedItem);
      
      // Faire l'appel avec les en-têtes d'authentification
      const response = await httpService.get(`/patient/documents/${selectedItem.id}/download`, {
        responseType: 'blob', // Important pour les fichiers
      });

      // Récupérer le type MIME depuis les en-têtes de réponse
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      console.log('📄 Type MIME du fichier:', contentType);
      console.log('📄 En-têtes de réponse:', response.headers);

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
      
      // Si toujours pas de nom de fichier, utiliser un nom par défaut avec l'extension appropriée
      if (!fileName) {
        const extension = contentType.includes('pdf') ? '.pdf' 
          : contentType.includes('image/jpeg') ? '.jpg'
          : contentType.includes('image/png') ? '.png'
          : contentType.includes('image') ? '.jpg'
          : '.pdf';
        fileName = `${selectedItem.name}${extension}`;
      }

      console.log('📁 Nom de fichier final pour téléchargement:', fileName);

      // Créer un lien de téléchargement avec le bon type MIME
      const blob = new Blob([response.data], { type: contentType });
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

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Retour
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

          {/* Contenu */}
          <div className="p-6">
            <div className="grid gap-6">
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

              {selectedItem.description && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h2>
                  <p className="text-gray-900">{selectedItem.description}</p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Télécharger le document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DocumentDetails;
