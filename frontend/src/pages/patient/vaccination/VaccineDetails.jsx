import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSyringe, FaArrowLeft } from "react-icons/fa";
import { useVaccinationContext } from "../../../context/VaccinationContext";
import PageWrapper from "../../../components/PageWrapper";
import { formatDateFrench } from "../../../utils";

const VaccineDetails = () => {
  const navigate = useNavigate();
  const { selectedItem, clearSelectedItem } = useVaccinationContext();

  // Si aucun vaccin n'est sélectionné, rediriger vers la liste
  if (!selectedItem) {
    navigate("/vaccination");
    return null;
  }

  const handleBack = () => {
    clearSelectedItem();
    navigate(-1);
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
                <FaSyringe className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedItem.nom_vaccin || selectedItem.name}
                </h1>
                <p className="text-gray-500">{formatDateFrench(selectedItem.date_vaccination) || selectedItem.date}</p>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Nom du vaccin
                </h2>
                <p className="text-gray-900">{selectedItem.nom_vaccin || selectedItem.name}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Médecin
                </h2>
                <p className="text-gray-900">{selectedItem.nom_medecin || selectedItem.doctor}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Lieu de vaccination
                </h2>
                <p className="text-gray-900">{selectedItem.lieu_vaccination || selectedItem.location}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Type de vaccin
                </h2>
                <p className="text-gray-900">{selectedItem.type_vaccin || selectedItem.type}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Fabricant
                </h2>
                <p className="text-gray-900">{selectedItem.fabricant || selectedItem.manufacturer}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Date de vaccination
                </h2>
                <p className="text-gray-900">{formatDateFrench(selectedItem.date_vaccination) || selectedItem.date}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Lot du vaccin
                </h2>
                <p className="text-gray-900">{selectedItem.lot_vaccin || selectedItem.subtitle}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Statut
                </h2>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedItem.statut === 'administré' || !selectedItem.statut ? 
                    'bg-green-100 text-green-800' :
                  selectedItem.statut === 'planifié' ? 
                    'bg-blue-100 text-blue-800' :
                  selectedItem.statut === 'rappel_nécessaire' ? 
                    'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                  {selectedItem.statut || 'Administré'}
                </span>
              </div>

              {(selectedItem.prochaine_dose || selectedItem.nextDose) && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Prochaine dose prévue
                  </h2>
                  <p className="text-gray-900">{formatDateFrench(selectedItem.prochaine_dose) || selectedItem.nextDose}</p>
                </div>
              )}

              {selectedItem.notes && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Notes
                  </h2>
                  <p className="text-gray-900">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default VaccineDetails;
