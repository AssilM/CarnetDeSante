import React from "react";
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
  const { selectedDoctor, selectedDate, selectedSlot, bookAppointment } =
    useDoctorContext();
  const { addItem } = useAppointmentContext();

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
  const handleConfirmAppointment = () => {
    // Créer l'objet de rendez-vous
    const appointment = {
      doctorId: selectedDoctor.id,
      date: selectedDate,
      time: selectedSlot,
      doctor: {
        name: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        address: selectedDoctor.address,
      },
      status: "confirmed",
      timestamp: new Date().getTime(),
    };

    // Mettre à jour les disponibilités du médecin
    const success = bookAppointment(appointment);

    if (success) {
      // Ajouter le rendez-vous à la liste des rendez-vous de l'utilisateur
      addItem({
        ...appointment,
        id: Date.now().toString(),
      });

      // Rediriger vers la page de succès
      navigate("/appointments?tab=upcoming");
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
            Retour à la sélection des créneaux
          </button>
        </div>

        {/* Titre de la page */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <FaCalendarCheck className="text-3xl text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Confirmation du rendez-vous
          </h1>
          <p className="text-gray-600 mt-1">
            Vérifiez les détails avant de confirmer votre rendez-vous
          </p>
        </div>

        {/* Détails du rendez-vous */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Détails du rendez-vous
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations du médecin */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <FaUserMd className="text-xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Médecin
                    </h3>
                    <p className="font-medium text-gray-900">
                      {selectedDoctor.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDoctor.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <FaMapMarkerAlt className="text-xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Adresse
                    </h3>
                    <p className="text-gray-900">{selectedDoctor.address}</p>
                  </div>
                </div>
              </div>

              {/* Date et heure */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <FaCalendarAlt className="text-xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <FaClock className="text-xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Heure</h3>
                    <p className="font-medium text-gray-900">{selectedSlot}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes et instructions */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Notes importantes
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Veuillez arriver 10 minutes avant votre rendez-vous</li>
              <li>Apportez votre carte d'identité et votre carte vitale</li>
              <li>
                En cas d'empêchement, veuillez annuler votre rendez-vous au
                moins 24h à l'avance
              </li>
            </ul>
          </div>
        </div>

        {/* Bouton de confirmation */}
        <div className="flex justify-center">
          <button
            onClick={handleConfirmAppointment}
            className="px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Confirmer le rendez-vous
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AppointmentConfirmation;
