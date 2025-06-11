import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarPlus, FaSearch, FaArrowLeft } from "react-icons/fa";
import { useDoctorContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const BookAppointment = () => {
  const navigate = useNavigate();
  const { specialties, searchDoctors, setSelectedDoctor } = useDoctorContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Gérer la recherche
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const results = searchDoctors(searchQuery);
    setSearchResults(results);
    setShowResults(true);
  };

  // Gérer la sélection d'un médecin dans les résultats
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    navigate("/book/slots");
  };

  // Gérer la sélection d'une spécialité
  const handleSpecialtySelect = (specialty) => {
    navigate(`/book/doctors?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}

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

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher un médecin par nom"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Résultats de recherche */}
        {showResults && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Résultats de recherche
            </h2>
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {searchResults.map((doctor) => (
                  <li key={doctor.id} className="py-4">
                    <button
                      onClick={() => handleDoctorSelect(doctor)}
                      className="w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {doctor.specialty}
                          </p>
                          <div className="flex items-center mt-1">
                            <FaMapMarkerAlt className="text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {doctor.address}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            <FaStar className="text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">
                              {doctor.rating}
                            </span>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                            Disponible
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-center py-4">
                Aucun médecin trouvé. Essayez avec un autre terme ou consultez
                nos spécialités.
              </p>
            )}
          </div>
        )}

        {/* Liste des spécialités */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Parcourir par spécialité
          </h2>
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
        </div>
      </div>
    </PageWrapper>
  );
};

export default BookAppointment;
