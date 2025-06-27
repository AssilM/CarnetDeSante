import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import PatientApi from "../api/PatientApi";

// Créer un contexte pour les patients
const PatientContext = createContext(null);

export const PatientProvider = ({ children }) => {
  const [patientProfile, setPatientProfile] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, accessToken } = useAuth();

  // Charger le profil du patient si l'utilisateur est connecté
  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (!currentUser || currentUser.role !== "patient") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profileData = await PatientApi.getProfile(
          currentUser.id,
          accessToken
        );
        setPatientProfile(profileData.patient);

        // Récupérer les informations médicales
        try {
          const medicalData = await PatientApi.getMedicalInfo(accessToken);
          setMedicalInfo(medicalData);
        } catch (medicalError) {
          console.error(
            "Erreur lors du chargement des informations médicales:",
            medicalError
          );
          // Ne pas bloquer le chargement du profil si les infos médicales échouent
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil patient:", error);
        setError("Impossible de charger votre profil patient");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, [currentUser, accessToken]);

  // Mettre à jour le profil patient
  const updatePatientProfile = async (patientData) => {
    if (!currentUser) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await PatientApi.createOrUpdateProfile(
        currentUser.id,
        patientData,
        accessToken
      );
      setPatientProfile(response.patient);
      return response.patient;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil patient:", error);
      setError("Impossible de mettre à jour votre profil");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Créer un profil patient lors de l'inscription
  const createPatientProfile = async (userId, patientData, token) => {
    try {
      const response = await PatientApi.createOrUpdateProfile(
        userId,
        patientData,
        token
      );
      return response;
    } catch (error) {
      console.error("Erreur lors de la création du profil patient:", error);
      throw error;
    }
  };

  // Récupérer manuellement les informations médicales
  const refreshMedicalInfo = async () => {
    if (!currentUser || !accessToken) return null;

    try {
      setLoading(true);
      const medicalData = await PatientApi.getMedicalInfo(accessToken);
      setMedicalInfo(medicalData);
      return medicalData;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations médicales:",
        error
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
