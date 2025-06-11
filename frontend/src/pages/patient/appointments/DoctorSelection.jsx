import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaStar,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { useDoctorContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";

const DoctorSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getDoctorsBySpecialty, setSelectedDoctor } = useDoctorContext();
  const [doctors, setDoctors] = useState([]);

  // Récupérer la spécialité depuis l'URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const specialty = queryParams.get("specialty");

    if (!specialty) {
      navigate("/book");
      return;
    }

    const filteredDoctors = getDoctorsBySpecialty(specialty);
    setDoctors(filteredDoctors);
  }, [location.search, getDoctorsBySpecialty, navigate]);

  // Gérer la sélection d'un médecin
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    navigate("/book/slots");
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/book")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Retour à la recherche
          </button>
        </div>

        {/* Titre de la page */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Choisir un médecin
          </h1>
          <p className="text-gray-600 mt-1">
            Sélectionnez un médecin pour voir ses disponibilités
          </p>
        </div>

        {/* Liste des médecins */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {doctors.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <li key={doctor.id}>
                  <button
                    onClick={() => handleDoctorSelect(doctor)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                          <img
                            src={
                              doctor.avatar || "https://via.placeholder.com/64"
                            }
                            alt={`Dr. ${doctor.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {doctor.specialty}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <FaMapMarkerAlt className="text-gray-400 mr-2" />
                          {doctor.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaPhoneAlt className="text-gray-400 mr-2" />
                          {doctor.phone}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-2">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="font-medium">{doctor.rating}</span>
                          <span className="text-gray-500 text-sm ml-1">
                            ({doctor.reviewCount} avis)
                          </span>
                        </div>
                        <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                          Disponible
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600">
                Aucun médecin trouvé pour cette spécialité.
              </p>
              <button
                onClick={() => navigate("/book")}
                className="mt-4 text-primary hover:text-primary/80"
              >
                Retour à la recherche
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default DoctorSelection;
