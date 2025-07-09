import React, { createContext, useContext, useState, useEffect } from "react";
import { httpService } from "../../services/http";
import { createPatientService } from "../../services/api";
import { useAuth } from "../AuthContext";

// ✅ Plus besoin de décoder le JWT - httpService gère tout automatiquement

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patientProfile, setPatientProfile] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientService, setPatientService] = useState(null);

  // ✅ Récupérer les données d'authentification - SIMPLIFIÉ
  const { currentUser } = useAuth();

  // ✅ Initialiser l'API - SIMPLIFIÉ
  useEffect(() => {
    // ✅ Utilisation directe de httpService - le refresh est automatique
    setPatientService(createPatientService(httpService));
  }, []); // ✅ Plus de dépendances complexes

  // Charger le profil du patient si l'utilisateur est connecté
  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (!currentUser) {
        console.log("[PatientContext] Pas d'utilisateur connecté");
        setLoading(false);
        return;
      }

      if (currentUser.role !== "patient") {
        console.log(
          "[PatientContext] L'utilisateur n'a pas le rôle patient:",
          currentUser.role
        );
        setLoading(false);
        return;
      }

      if (!patientService) {
        console.log("[PatientContext] Service patient non initialisé");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(
          `[PatientContext] Récupération du profil pour l'utilisateur #${currentUser.id}`
        );
        const profileData = await patientService.getPatientProfileByUserId(
          currentUser.id
        );
        console.log("[PatientContext] Profil récupéré:", profileData);
        setPatientProfile(profileData.patient);

        // Récupérer les informations médicales
        try {
          console.log(
            "[PatientContext] Récupération des informations médicales"
          );
          const medicalData = await patientService.getMedicalInfo();
          console.log(
            "[PatientContext] Informations médicales récupérées:",
            medicalData
          );
          setMedicalInfo(medicalData);
        } catch (medicalError) {
          console.error(
            "[PatientContext] Erreur lors du chargement des informations médicales:",
            medicalError.response?.data || medicalError
          );
          // Ne pas bloquer le chargement du profil si les infos médicales échouent
        }
      } catch (error) {
        console.error(
          "[PatientContext] Erreur lors du chargement du profil patient:",
          error.response?.data || error
        );
        setError("Impossible de charger votre profil patient");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, [currentUser, patientService]);

  // Mettre à jour le profil patient
  const updatePatientProfile = async (patientData) => {
    if (!currentUser || !patientService) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await patientService.createOrUpdatePatientProfile(
        currentUser.id,
        patientData
      );
      setPatientProfile(response.patient);
      return response.patient;
    } catch (error) {
      console.error(
        "[PatientContext] Erreur lors de la mise à jour du profil patient:",
        error.response?.data || error
      );
      setError("Impossible de mettre à jour votre profil");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Créer un profil patient lors de l'inscription
  const createPatientProfile = async (userId, patientData) => {
    if (!patientService) return null;

    try {
      const response = await patientService.createOrUpdatePatientProfile(
        userId,
        patientData
      );
      return response;
    } catch (error) {
      console.error(
        "[PatientContext] Erreur lors de la création du profil patient:",
        error.response?.data || error
      );
      throw error;
    }
  };

  // Récupérer manuellement les informations médicales
  const refreshMedicalInfo = async () => {
    if (!currentUser || !patientService) {
      console.log(
        "[PatientContext] refreshMedicalInfo: Pas d'utilisateur ou de service"
      );
      return null;
    }

    try {
      console.log(
        "[PatientContext] refreshMedicalInfo: Récupération des informations médicales"
      );
      setLoading(true);
      const medicalData = await patientService.getMedicalInfo();
      console.log(
        "[PatientContext] refreshMedicalInfo: Informations récupérées:",
        medicalData
      );
      setMedicalInfo(medicalData);
      return medicalData;
    } catch (error) {
      console.error(
        "[PatientContext] Erreur lors de la récupération des informations médicales:",
        error.response?.data || error
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    patientProfile,
    medicalInfo,
    loading,
    error,
    updatePatientProfile,
    createPatientProfile,
    refreshMedicalInfo,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error(
      "usePatientContext doit être utilisé avec un PatientProvider"
    );
  }
  return context;
};
