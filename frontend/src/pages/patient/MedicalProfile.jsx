import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { FaUserMd } from "react-icons/fa";
import InfoSection from "../../components/patient/medical/InfoSection";
import { useMedicalInfoContext } from "../../context";
import { useAuth } from "../../context/AuthContext";

/**
 * Page principale du profil médical
 * Affiche uniquement les informations personnelles du patient
 */
const MedicalProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Contexte pour les informations médicales
  const { setSelectedItem: setSelectedInfo } = useMedicalInfoContext();

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "Non renseigné";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Utiliser useMemo pour éviter la recréation à chaque rendu
  const patientInfo = useMemo(() => {
    if (!currentUser) {
      return {
        id: "info-1",
        firstName: "Jean",
        lastName: "Dupont",
        age: 30,
        gender: "H",
        bloodType: "A",
        height: 180,
        weight: 80,
      };
    }

    return {
      id: currentUser.id,
      firstName: currentUser.prenom || "Non renseigné",
      lastName: currentUser.nom || "Non renseigné",
      age: currentUser.date_naissance
        ? calculateAge(currentUser.date_naissance)
        : "Non renseigné",
      gender: currentUser.sexe || "Non renseigné",
      bloodType: "Non renseigné", // À compléter si disponible dans currentUser
      height: "Non renseigné", // À compléter si disponible dans currentUser
      weight: "Non renseigné", // À compléter si disponible dans currentUser
      email: currentUser.email || "Non renseigné",
      phone: currentUser.tel || "Non renseigné",
    };
  }, [currentUser]);

  /**
   * Gestionnaire d'événement pour modifier les informations
   */
  const handleModifyInfo = () => {
    setSelectedInfo(patientInfo);
    navigate("/medical-profile/edit");
  };

  return (
    <PageWrapper className="bg-gray-50">
      {/* En-tête de la page avec icône et titre */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <FaUserMd className="text-2xl text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Profil médical
              </h1>
              <p className="text-sm text-gray-600">
                Contient vos informations médicales importantes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal - Informations personnelles uniquement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <InfoSection
            patientInfo={patientInfo}
            onModify={handleModifyInfo}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default MedicalProfile;
