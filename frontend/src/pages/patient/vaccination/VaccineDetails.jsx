import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSyringe, FaArrowLeft } from "react-icons/fa";
import { useVaccinationContext } from "../../../context/VaccinationContext";
import PageWrapper from "../../../components/PageWrapper";
import dayjs from "dayjs";
import "dayjs/locale/fr";

const VaccineDetails = () => {
  const navigate = useNavigate();
  const { selectedItem, clearSelectedItem } = useVaccinationContext();

  // Utiliser useEffect pour la navigation au lieu de l'appeler directement dans le rendu
  useEffect(() => {
    if (!selectedItem) {
      navigate("/vaccination");
    }
  }, [selectedItem, navigate]);

  if (!selectedItem) {
    return null; // Retourner null au lieu de naviguer directement
  }

  const handleBack = () => {
    clearSelectedItem();
    navigate(-1);
  };

  // Format date FR
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dayjs(dateStr).locale("fr").format("DD/MM/YYYY");
  };

  // Badge statut
  const renderStatutBadge = () => {
    if (!selectedItem.status) return null;
    const color = selectedItem.status === "effectué" ? "bg-green-100 text-green-700 border-green-300" : "bg-orange-100 text-orange-700 border-orange-300";
    const label = selectedItem.status === "effectué" ? "Effectué" : "À faire";
    return (
      <span className={`inline-block border px-2 py-0.5 rounded text-xs font-semibold ml-2 ${color}`}>{label}</span>
    );
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaSyringe className="text-2xl text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                  {selectedItem.name}
                  {renderStatutBadge()}
                </h1>

                <p className="text-gray-500">{formatDate(selectedItem.date)}</p>

              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Nom du vaccin</h2>
                <p className="text-gray-900">{selectedItem.name}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Date de vaccination</h2>
                <p className="text-gray-900">{formatDate(selectedItem.date)}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Nom du vaccinateur</h2>
                <p className="text-gray-900">{selectedItem.doctor}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Lieu de vaccination</h2>
                <p className="text-gray-900">{selectedItem.location}</p>
              </div>


              {selectedItem.nextDose && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">
                    Prochaine dose prévue
                  </h2>
                  <p className="text-gray-900">
                    {dayjs(selectedItem.nextDose).locale("fr").format("DD/MM/YYYY")}
                  </p>
                </div>
              )}


              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Type de vaccin</h2>
                <p className="text-gray-900">{selectedItem.type}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Fabricant</h2>
                <p className="text-gray-900">{selectedItem.manufacturer}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Lot du vaccin</h2>
                <p className="text-gray-900">{selectedItem.lot}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Statut</h2>
                <p className="text-gray-900">{selectedItem.status === "effectué" ? "Effectué" : "À faire"}</p>
              </div>
              <div className="md:col-span-2">
                <h2 className="text-sm font-medium text-gray-500 mb-1">Notes</h2>
                <p className="text-gray-900 whitespace-pre-line">{selectedItem.notes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default VaccineDetails;