import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { useDocumentContext } from "../../../context/DocumentContext";
import PageWrapper from "../../../components/PageWrapper";

const DocumentDetails = () => {
  const navigate = useNavigate();
  const { selectedDocument } = useDocumentContext();

  // Si aucun document n'est sélectionné, rediriger vers la liste
  if (!selectedDocument) {
    navigate("/documents");
    return null;
  }

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
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
                  {selectedDocument.name}
                </h1>
                <p className="text-gray-500">{selectedDocument.date}</p>
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
                <p className="text-gray-900">{selectedDocument.type}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Émis par
                </h2>
                <p className="text-gray-900">{selectedDocument.issuedBy}</p>
              </div>

              {selectedDocument.description && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h2>
                  <p className="text-gray-900">
                    {selectedDocument.description}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => window.open(selectedDocument.url, "_blank")}
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
