import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaUserMd,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { useDoctorContext, useAppointmentContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const AppointmentConfirmation = () => {
  const navigate = useNavigate();
  const { selectedDoctor, selectedDate, selectedSlot, resetSelection } =
    useDoctorContext();
  const { addAppointment } = useAppointmentContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Rediriger si les informations ne sont pas complètes
  if (!selectedDoctor || !selectedDate || !selectedSlot) {
    navigate("/book-appointment");
    return null;
  }

  // Formater une date pour l'affichage
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fonction pour confirmer le rendez-vous
  const handleConfirmAppointment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Créer l'objet de rendez-vous
      const appointmentData = {
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedSlot,
        title: "Consultation médicale", // Motif par défaut
        doctor: {
          name: `${selectedDoctor.prenom || ""} ${
            selectedDoctor.nom || ""
          }`.trim(),
          specialty: selectedDoctor.specialite || "",
          address: selectedDoctor.adresse || "",
        },
        location: selectedDoctor.adresse || "",
      };

      // Ajouter le rendez-vous via l'API
      const result = await addAppointment(appointmentData);

      if (result) {
        // Réinitialiser la sélection
        resetSelection();

        // Rediriger vers la page des rendez-vous
        navigate("/appointments?tab=upcoming");
      } else {
        setError("Impossible de créer le rendez-vous. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la création du rendez-vous:", err);
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/book-appointment/slot")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Retour à la sélection de créneau
          </button>
        </div>

        {/* Titre de la page */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FaCalendarCheck className="text-3xl text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Confirmation de rendez-vous
          </h1>
          <p className="text-gray-600 mt-2">
            Veuillez vérifier les informations avant de confirmer
          </p>
        </div>

        {/* Affichage de l'erreur si nécessaire */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Détails du rendez-vous */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Détails du rendez-vous
            </h2>

            <div className="space-y-4">
              {/* Médecin */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaUserMd className="text-primary w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Médecin</p>
                  <p className="text-sm text-gray-600">
                    {selectedDoctor.prenom} {selectedDoctor.nom} -{" "}
                    {selectedDoctor.specialite}
                  </p>
                </div>
              </div>

              {/* Adresse */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaMapMarkerAlt className="text-primary w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">
                    {selectedDoctor.adresse || "Non spécifiée"}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaCalendarAlt className="text-primary w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              {/* Heure */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaClock className="text-primary w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Heure</p>
                  <p className="text-sm text-gray-600">{selectedSlot}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/book-appointment")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmAppointment}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Confirmation en cours..." : "Confirmer le rendez-vous"}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AppointmentConfirmation;
