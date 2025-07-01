import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaUserMd,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaClipboardList,
} from "react-icons/fa";
import { useAppointmentContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const AppointmentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAppointment } = useAppointmentContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [motif, setMotif] = useState("Consultation médicale");

  // Récupérer les données du rendez-vous depuis l'état de navigation
  useEffect(() => {
    if (
      location.state?.doctor &&
      location.state?.date &&
      location.state?.time
    ) {
      setAppointmentData({
        doctor: location.state.doctor,
        date: location.state.date,
        time: location.state.time,
        formattedDate: location.state.formattedDate,
        formattedTime: location.state.formattedTime,
      });
    } else {
      navigate("/book-appointment");
    }
  }, [location.state, navigate]);

  // Rediriger si les informations ne sont pas complètes
  if (!appointmentData) {
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

  // Gérer le changement du motif
  const handleMotifChange = (e) => {
    setMotif(e.target.value);
  };

  // Fonction pour confirmer le rendez-vous
  const handleConfirmAppointment = async () => {
    console.log(
      "[AppointmentConfirmation] Début de la confirmation du rendez-vous"
    );
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Créer l'objet de rendez-vous
      const rdvData = {
        doctorId: appointmentData.doctor.id,
        date: appointmentData.date,
        time: appointmentData.time,
        motif: motif.trim(),
        doctor: {
          name: `${appointmentData.doctor.prenom || ""} ${
            appointmentData.doctor.nom || ""
          }`.trim(),
          specialty: appointmentData.doctor.specialite || "",
          address: appointmentData.doctor.adresse || "",
        },
        location: appointmentData.doctor.adresse || "",
      };

      console.log("[AppointmentConfirmation] Données du rendez-vous:", rdvData);

      // Ajouter le rendez-vous via l'API
      console.log("[AppointmentConfirmation] Appel à addAppointment");
      const result = await addAppointment(rdvData);
      console.log(
        "[AppointmentConfirmation] Résultat de addAppointment:",
        result
      );

      if (result) {
        console.log("[AppointmentConfirmation] Rendez-vous créé avec succès");
        setSuccess(true);

        // Attendre 2 secondes avant de rediriger pour montrer le message de succès
        setTimeout(() => {
          navigate(`/appointment-details/${result.id}`, {
            state: { appointment: result, fromConfirmation: true },
          });
        }, 2000);
      } else {
        console.error(
          "[AppointmentConfirmation] Échec de la création du rendez-vous"
        );
        setError("Impossible de créer le rendez-vous. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(
        "[AppointmentConfirmation] Erreur lors de la création du rendez-vous:",
        err
      );
      console.error("[AppointmentConfirmation] Message d'erreur:", err.message);
      console.error(
        "[AppointmentConfirmation] Réponse d'erreur:",
        err.response?.data
      );
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
            onClick={() => navigate(-1)}
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
            Veuillez préciser le motif de votre rendez-vous
          </p>
        </div>

        {/* Affichage du message de succès */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
            <FaCalendarCheck className="mr-2 text-green-500" />
            <span>
              Votre rendez-vous a été créé avec succès ! Redirection vers les
              détails...
            </span>
          </div>
        )}

        {/* Affichage de l'erreur si nécessaire */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Détails du rendez-vous */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Détails du rendez-vous
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Médecin */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaUserMd className="text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500">Médecin</h3>
                <p className="text-base text-gray-900">
                  {`${appointmentData.doctor.prenom || ""} ${
                    appointmentData.doctor.nom || ""
                  }`.trim()}
                </p>
                {appointmentData.doctor.specialite && (
                  <p className="text-sm text-gray-600">
                    {appointmentData.doctor.specialite}
                  </p>
                )}
              </div>
            </div>

            {/* Lieu */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaMapMarkerAlt className="text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                <p className="text-base text-gray-900">
                  {appointmentData.doctor.adresse || "Non spécifié"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaCalendarAlt className="text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-base text-gray-900">
                  {appointmentData.formattedDate ||
                    formatDate(appointmentData.date)}
                </p>
              </div>
            </div>

            {/* Heure */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaClock className="text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500">Heure</h3>
                <p className="text-base text-gray-900">
                  {appointmentData.formattedTime || appointmentData.time}
                </p>
              </div>
            </div>

            {/* Motif */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaClipboardList className="text-primary" />
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Motif de la consultation
                </h3>
                <textarea
                  value={motif}
                  onChange={handleMotifChange}
                  placeholder="Veuillez préciser le motif de votre consultation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  disabled={loading || success}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/book-appointment")}
            className={`px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors ${
              loading || success ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading || success}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmAppointment}
            disabled={loading || !motif.trim() || success}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              loading || !motif.trim() || success
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {loading
              ? "Confirmation en cours..."
              : success
              ? "Rendez-vous confirmé !"
              : "Confirmer le rendez-vous"}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AppointmentConfirmation;
