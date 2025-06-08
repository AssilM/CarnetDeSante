import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { useHealthEventContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const HealthEventDetails = () => {
  const navigate = useNavigate();
  const { selectedItem, clearSelectedItem } = useHealthEventContext();

  // Si aucun événement n'est sélectionné, rediriger vers la liste
  if (!selectedItem) {
    navigate("/medical-profile?tab=historique");
    return null;
  }

  const handleBack = () => {
    clearSelectedItem();
    navigate("/medical-profile?tab=historique");
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
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedItem.title || "Événement de santé"}
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
                  Type d'événement
                </h2>
                <p className="text-gray-900">{selectedItem.title}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Date</h2>
                <p className="text-gray-900">{selectedItem.date}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Médecin
                </h2>
                <p className="text-gray-900">{selectedItem.doctor}</p>
              </div>

              {selectedItem.location && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Lieu
                  </h2>
                  <p className="text-gray-900">{selectedItem.location}</p>
                </div>
              )}

              {selectedItem.description && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h2>
                  <p className="text-gray-900">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.result && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Résultat
                  </h2>
                  <p className="text-gray-900">{selectedItem.result}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HealthEventDetails;
