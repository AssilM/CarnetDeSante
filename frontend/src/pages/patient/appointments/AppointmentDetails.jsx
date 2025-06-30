import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUserMd,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";
import { useAppointmentContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const { selectedAppointment, cancelAppointment } = useAppointmentContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si aucun rendez-vous n'est sélectionné, rediriger vers la liste
  if (!selectedAppointment) {
    navigate("/appointments");
    return null;
  }

  const handleBack = () => {
    navigate(-1);
  };

  // Gérer l'annulation du rendez-vous
  const handleCancelAppointment = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      setLoading(true);
      setError(null);

      try {
        const success = await cancelAppointment(selectedAppointment.id);
        if (success) {
          navigate("/appointments?tab=past");
        } else {
          setError("Impossible d'annuler le rendez-vous");
        }
      } catch (err) {
        console.error("Erreur lors de l'annulation du rendez-vous:", err);
        setError("Une erreur est survenue lors de l'annulation");
      } finally {
        setLoading(false);
      }
    }
  };

  // Déterminer si le rendez-vous est passé ou à venir
  const isPast =
    selectedAppointment.timestamp <= new Date().getTime() ||
    selectedAppointment.status === "annulé";

  // Déterminer la classe et le texte du statut
  let statusClass = "bg-green-100 text-green-800";
  let statusText = "Confirmé";

  if (selectedAppointment.status === "annulé") {
    statusClass = "bg-red-100 text-red-800";
    statusText = "Annulé";
  } else if (isPast) {
    statusClass = "bg-gray-200 text-gray-700";
    statusText = "Terminé";
  }

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

        {/* Affichage de l'erreur si nécessaire */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* En-tête de la carte */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-2xl text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedAppointment.title}
                </h1>
                <p className="text-gray-500">{selectedAppointment.date}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
              >
                {statusText}
              </div>
            </div>
          </div>

          {/* Corps de la carte */}
          <div className="p-6 space-y-6">
            {/* Informations sur le rendez-vous */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaUserMd className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Médecin</h3>
                  <p className="text-base text-gray-900">
                    {selectedAppointment.doctor.name}
                  </p>
                  {selectedAppointment.doctor.specialty && (
                    <p className="text-sm text-gray-600">
                      {selectedAppointment.doctor.specialty}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                  <p className="text-base text-gray-900">
                    {selectedAppointment.location ||
                      selectedAppointment.doctor.address ||
                      "Non spécifié"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Heure</h3>
                  <p className="text-base text-gray-900">
                    {selectedAppointment.time || "Heure non précisée"}
                  </p>
                </div>
              </div>

              {selectedAppointment.description && (
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Détails
                    </h3>
                    <p className="text-base text-gray-900">
                      {selectedAppointment.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions disponibles */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {!isPast && selectedAppointment.status !== "annulé" && (
                  <>
                    <button
                      onClick={() =>
                        navigate(
                          `/book-appointment/edit/${selectedAppointment.id}`
                        )
                      }
                      className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={handleCancelAppointment}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
                    >
                      {loading ? "Annulation en cours..." : "Annuler"}
                    </button>
                  </>
                )}
                {isPast && selectedAppointment.status !== "annulé" && (
                  <button
                    onClick={() =>
                      navigate(
                        "/documents/add?type=appointment&id=" +
                          selectedAppointment.id
                      )
                    }
                    className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Ajouter un document
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AppointmentDetails;
