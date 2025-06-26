import React from "react";
import { useNavigate } from "react-router-dom";
import { FaAllergies, FaArrowLeft } from "react-icons/fa";
import { useAllergyContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const AllergyDetails = () => {
  const navigate = useNavigate();
  const { selectedItem, clearSelectedItem } = useAllergyContext();

  // Si aucune allergie n'est sélectionnée, rediriger vers la liste
  if (!selectedItem) {
    navigate("/medical-profile/allergies");
    return null;
  }

  const handleBack = () => {
    clearSelectedItem();
    navigate("/medical-profile/allergies");
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
                <FaAllergies className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedItem.type || "Allergie"}
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
                  Type d'allergie
                </h2>
                <p className="text-gray-900">
                  {selectedItem.type || "Non spécifiée"}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Date de diagnostic
                </h2>
                <p className="text-gray-900">{selectedItem.date}</p>
              </div>

              {selectedItem.severity && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Sévérité
                  </h2>
                  <p className="text-gray-900">{selectedItem.severity}</p>
                </div>
              )}

              {selectedItem.reaction && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Réaction
                  </h2>
                  <p className="text-gray-900">{selectedItem.reaction}</p>
                </div>
              )}

              {selectedItem.treatment && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Traitement
                  </h2>
                  <p className="text-gray-900">{selectedItem.treatment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AllergyDetails;
