import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { FaUserMd } from "react-icons/fa";
import InfoSection from "../../components/patient/medical/InfoSection";
import MedicalHistorySection from "../../components/patient/medical/MedicalHistorySection";
import AllergiesSection from "../../components/patient/medical/AllergiesSection";
import HealthHistorySection from "../../components/patient/medical/HealthHistorySection";
import {
  useMedicalInfoContext,
  useMedicalHistoryContext,
  useAllergyContext,
  useHealthEventContext,
} from "../../context";

/**
 * Page principale du profil médical
 * Gère l'affichage et la navigation entre les différentes sections du profil médical
 * Utilise un système d'onglets pour alterner entre les informations personnelles et l'historique
 */
const MedicalProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Contextes pour les différentes sections
  const { setSelectedItem: setSelectedInfo, setItems: setInfoItems } =
    useMedicalInfoContext();
  const { setSelectedItem: setSelectedHistory, setItems: setHistoryItems } =
    useMedicalHistoryContext();
  const { setSelectedItem: setSelectedAllergy, setItems: setAllergyItems } =
    useAllergyContext();
  const { setSelectedItem: setSelectedEvent, setItems: setEventItems } =
    useHealthEventContext();

  // Lecture du paramètre de requête pour définir l'onglet actif initial
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get("tab");

  // État pour gérer l'onglet actif (informations ou historique)
  const [activeTab, setActiveTab] = useState(
    tabParam === "historique" ? "historique" : "informations"
  );
  // État pour le filtre de l'historique de santé (jour/mois/année)
  const [activeFilter, setActiveFilter] = useState("jour");

  // Nombre maximum d'éléments à afficher dans chaque section
  const MAX_ITEMS_TO_DISPLAY = 2;

  // Données de test pour le développement
  // À remplacer par des appels API dans la version finale
  const patientInfo = {
    id: "info-1",
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
      id: "history-1",
      type: "Type de maladie 1",
      date: "01/01/2023",
      description: "Description de la maladie 1",
      treatment: "Traitement prescrit pour la maladie 1",
    },
    {
      id: "history-2",
      type: "Type de maladie 2",
      date: "02/02/2023",
      description: "Description de la maladie 2",
      treatment: "Traitement prescrit pour la maladie 2",
    },
    {
      id: "history-3",
      type: "Type de maladie 3",
      date: "03/03/2023",
      description: "Description de la maladie 3",
      treatment: "Traitement prescrit pour la maladie 3",
    },
    {
      id: "history-4",
      type: "Type de maladie 4",
      date: "04/04/2023",
      description: "Description de la maladie 4",
      treatment: "Traitement prescrit pour la maladie 4",
    },
  ];

  const allergies = [
    {
      id: "allergy-1",
      type: "Type d'allergie 1",
      date: "10/01/2023",
      severity: "Légère",
      reaction: "Réaction à l'allergie 1",
      treatment: "Traitement pour l'allergie 1",
    },
    {
      id: "allergy-2",
      type: "Type d'allergie 2",
      date: "20/02/2023",
      severity: "Modérée",
      reaction: "Réaction à l'allergie 2",
      treatment: "Traitement pour l'allergie 2",
    },
    {
      id: "allergy-3",
      type: "Type d'allergie 3",
      date: "30/03/2023",
      severity: "Sévère",
      reaction: "Réaction à l'allergie 3",
      treatment: "Traitement pour l'allergie 3",
    },
  ];

  const healthEvents = [
    {
      id: "event-1",
      date: "10/04/2023",
      title: "Suivi médical dentaire",
      doctor: "Docteur X",
      location: "Cabinet médical A",
      description: "Contrôle dentaire régulier",
      result: "Aucun problème détecté",
    },
    {
      id: "event-2",
      date: "15/05/2023",
      title: "Suivi médical général",
      doctor: "Docteur Y",
      location: "Hôpital B",
      description: "Bilan annuel de santé",
      result: "Résultats normaux",
    },
    {
      id: "event-3",
      date: "20/06/2023",
      title: "Examen ophtalmologique",
      doctor: "Docteur Z",
      location: "Clinique C",
      description: "Contrôle de la vue",
      result: "Prescription de nouvelles lunettes",
    },
  ];

  // Initialisation des données dans les contextes
  useEffect(() => {
    setInfoItems([patientInfo]);
    setHistoryItems(medicalHistory);
    setAllergyItems(allergies);
    setEventItems(healthEvents);
  }, [setInfoItems, setHistoryItems, setAllergyItems, setEventItems]);

  /**
   * Gestionnaires d'événements pour les différentes actions utilisateur
   * Ces fonctions naviguent vers les pages correspondantes
   */
  const handleModifyInfo = () => {
    setSelectedInfo(patientInfo);
    navigate("/medical-profile/edit");
  };

  const handleAddHistory = () => {
    navigate("/medical-profile/history/add");
  };

  const handleHistoryDetails = (item) => {
    setSelectedHistory(item);
    navigate("/medical-profile/history/details");
  };

  const handleViewAllHistory = () => {
    navigate("/medical-profile/history");
  };

  const handleAddAllergy = () => {
    navigate("/medical-profile/allergies/add");
  };

  const handleAllergyDetails = (allergy) => {
    setSelectedAllergy(allergy);
    navigate("/medical-profile/allergies/details");
  };

  const handleViewAllAllergies = () => {
    navigate("/medical-profile/allergies");
  };

  const handleHealthEventDetails = (event) => {
    setSelectedEvent(event);
    navigate("/medical-profile/details");
  };

  const handleViewAllEvents = () => {
    navigate("/medical-profile");
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

      {/* Barre de navigation entre les onglets */}
      <div className="bg-gray-50 border-b border-gray-200">
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
              onViewAll={handleViewAllHistory}
              limit={MAX_ITEMS_TO_DISPLAY}
            />
            <AllergiesSection
              allergies={allergies}
              onAdd={handleAddAllergy}
              onDetails={handleAllergyDetails}
              onViewAll={handleViewAllAllergies}
              limit={MAX_ITEMS_TO_DISPLAY}
            />
          </div>
        ) : (
          // Section Historique : affiche l'historique des événements de santé
          <HealthHistorySection
            events={healthEvents}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onDetails={handleHealthEventDetails}
            onViewAll={handleViewAllEvents}
            limit={5} // Limite pour la section d'historique
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default MedicalProfile;
