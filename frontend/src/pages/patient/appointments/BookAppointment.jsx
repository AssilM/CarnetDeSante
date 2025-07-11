import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarPlus } from "react-icons/fa";
import { useDoctorContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const BookAppointment = () => {
  const navigate = useNavigate();
  const { specialties, loadDoctors, loading, error } = useDoctorContext();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Charger les spécialités au chargement du composant
  useEffect(() => {
    // Éviter les appels multiples
    if (hasInitialized) return;

    const fetchSpecialties = async () => {
      setIsLoading(true);
      await loadDoctors();
      setIsLoading(false);
      setHasInitialized(true);
    };

    fetchSpecialties();
  }, [loadDoctors, hasInitialized]);

  // Gérer la sélection d'une spécialité
  const handleSpecialtySelect = (specialty) => {
    navigate(
      `/book-appointment/doctor?specialty=${encodeURIComponent(specialty)}`
    );
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Titre de la page */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <FaCalendarPlus className="text-3xl text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Prendre un rendez-vous
          </h1>
          <p className="text-gray-600 mt-2">
            Trouvez un médecin et prenez rendez-vous en quelques clics
          </p>
        </div>

        {/* Affichage de l'erreur si nécessaire */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Liste des spécialités */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Parcourir par spécialité
          </h2>

          {isLoading || loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chargement des spécialités...</p>
            </div>
          ) : specialties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtySelect(specialty)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-medium text-gray-900">{specialty}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">
                Aucune spécialité disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default BookAppointment;
