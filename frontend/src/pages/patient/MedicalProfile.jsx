import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { FaUserMd } from "react-icons/fa";
import InfoSection from "../../components/patient/medical/InfoSection";
import MedicalHistorySection from "../../components/patient/medical/MedicalHistorySection";
import AllergiesSection from "../../components/patient/medical/AllergiesSection";
import HealthHistorySection from "../../components/patient/medical/HealthHistorySection";
import EditInfoForm from "../../components/patient/medical/forms/EditInfoForm";
import AddMedicalHistoryForm from "../../components/patient/medical/forms/AddMedicalHistoryForm";
import AddAllergyForm from "../../components/patient/medical/forms/AddAllergyForm";
import MedicalHistoryDetails from "../../components/patient/medical/details/MedicalHistoryDetails";
import AllergyDetails from "../../components/patient/medical/details/AllergyDetails";
import HealthEventDetails from "../../components/patient/medical/details/HealthEventDetails";

/**
 * Page principale du profil médical
 * Gère l'affichage et la navigation entre les différentes sections du profil médical
 * Utilise un système d'onglets pour alterner entre les informations personnelles et l'historique
 */
const MedicalProfile = () => {
  // État pour gérer l'onglet actif (informations ou historique)
  const [activeTab, setActiveTab] = useState("informations");
  // État pour le filtre de l'historique de santé (jour/mois/année)
  const [activeFilter, setActiveFilter] = useState("jour");
  // États pour gérer l'affichage des formulaires
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);

  // États pour gérer l'affichage des détails
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedAllergy, setSelectedAllergy] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Données de test pour le développement
  // À remplacer par des appels API dans la version finale
  const patientInfo = {
    firstName: "Jean",
    lastName: "Dupont",
    age: 30,
    gender: "H",
    bloodType: "A",
    height: 180,
    weight: 80,
  };

  const medicalHistory = [
    {
      type: "Type de maladie",
      date: "Date de début",
    },
    {
      type: "Type de maladie",
      date: "Date de début",
    },
  ];

  const allergies = [
    {
      type: "Type d'allergies",
      date: "Date de début",
    },
    {
      type: "Type d'allergies",
      date: "Date de début",
    },
  ];

  const healthEvents = [
    {
      date: "10 avril 2025",
      title: "Suivi médical dentaire",
      doctor: "Docteur X",
    },
    {
      date: "10 avril 2025",
      title: "Suivi médical dentaire",
      doctor: "Docteur X",
    },
    {
      date: "10 février 2025",
      title: "Suivi médical dentaire",
      doctor: "Docteur X",
    },
  ];

  /**
   * Gestionnaires d'événements pour les différentes actions utilisateur
   * Ces fonctions seront connectées à l'API dans la version finale
   */
  const handleModifyInfo = () => {
    setShowEditInfo(true);
  };

  const handleAddHistory = () => {
    setShowAddHistory(true);
  };

  const handleHistoryDetails = (item) => {
    setSelectedHistory(item);
  };

  const handleAddAllergy = () => {
    setShowAddAllergy(true);
  };

  const handleAllergyDetails = (allergy) => {
    setSelectedAllergy(allergy);
  };

  const handleHealthEventDetails = (event) => {
    setSelectedEvent(event);
  };

  // Gestionnaires pour la soumission des formulaires
  const handleInfoSubmit = (data) => {
    console.log("Nouvelles informations:", data);
    setShowEditInfo(false);
  };

  const handleHistorySubmit = (data) => {
    console.log("Nouvel antécédent:", data);
    setShowAddHistory(false);
  };

  const handleAllergySubmit = (data) => {
    console.log("Nouvelle allergie:", data);
    setShowAddAllergy(false);
  };

  // Si un formulaire est actif, on l'affiche à la place du contenu principal
  if (showEditInfo) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="mt-10">
          <EditInfoForm
            initialData={patientInfo}
            onSubmit={handleInfoSubmit}
            onCancel={() => setShowEditInfo(false)}
          />
        </div>
      </PageWrapper>
    );
  }

  if (showAddHistory) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="mt-10">
          <AddMedicalHistoryForm
            onSubmit={handleHistorySubmit}
            onCancel={() => setShowAddHistory(false)}
          />
        </div>
      </PageWrapper>
    );
  }

  if (showAddAllergy) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="mt-10">
          <AddAllergyForm
            onSubmit={handleAllergySubmit}
            onCancel={() => setShowAddAllergy(false)}
          />
        </div>
      </PageWrapper>
    );
  }

  // Si des détails sont sélectionnés, on les affiche
  if (selectedHistory) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="mt-10">
          <MedicalHistoryDetails
            history={selectedHistory}
            onClose={() => setSelectedHistory(null)}
          />
        </div>
      </PageWrapper>
    );
  }

  if (selectedAllergy) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="mt-10">
          <AllergyDetails
            allergy={selectedAllergy}
            onClose={() => setSelectedAllergy(null)}
          />
        </div>
      </PageWrapper>
    );
  }

  if (selectedEvent) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="mt-10">
          <HealthEventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="bg-gray-50">
      {/* En-tête de la page avec icône et titre */}
      <div className="bg-white">
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

      {/* Barre de navigation entre les onglets */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center">
            <div className="flex w-full sm:w-auto justify-between sm:justify-center sm:space-x-8 md:space-x-12">
              {/* Bouton pour l'onglet Informations */}
              <button
                onClick={() => setActiveTab("informations")}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap transition-colors ${
                  activeTab === "informations"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Mes informations
                <br className="sm:hidden" /> médicales personnelles
              </button>
              {/* Bouton pour l'onglet Historique */}
              <button
                onClick={() => setActiveTab("historique")}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap transition-colors ${
                  activeTab === "historique"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Historique de santé
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Contenu principal - Affichage conditionnel selon l'onglet actif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "informations" ? (
          // Section Informations : affiche les infos personnelles, antécédents et allergies
          <div className="space-y-6">
            <InfoSection
              patientInfo={patientInfo}
              onModify={handleModifyInfo}
            />
            <MedicalHistorySection
              history={medicalHistory}
              onAdd={handleAddHistory}
              onDetails={handleHistoryDetails}
            />
            <AllergiesSection
              allergies={allergies}
              onAdd={handleAddAllergy}
              onDetails={handleAllergyDetails}
            />
          </div>
        ) : (
          // Section Historique : affiche l'historique des événements de santé
          <HealthHistorySection
            events={healthEvents}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onDetails={handleHealthEventDetails}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default MedicalProfile;
