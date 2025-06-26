import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaArrowLeft } from "react-icons/fa";
import { useMedicalHistoryContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const MedicalHistoryDetails = () => {
  const navigate = useNavigate();
  const { selectedItem, clearSelectedItem } = useMedicalHistoryContext();

  // Si aucun antécédent n'est sélectionné, rediriger vers la liste
  if (!selectedItem) {
    navigate("/medical-profile/history");
    return null;
  }

  const handleBack = () => {
    clearSelectedItem();
    navigate("/medical-profile/history");
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
                <FaHistory className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedItem.type || "Antécédent médical"}
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
                  Type d'antécédent
                </h2>
                <p className="text-gray-900">
                  {selectedItem.type || "Non spécifié"}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Date de début
                </h2>
                <p className="text-gray-900">{selectedItem.date}</p>
              </div>

              {selectedItem.description && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h2>
                  <p className="text-gray-900">{selectedItem.description}</p>
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

export default MedicalHistoryDetails;
