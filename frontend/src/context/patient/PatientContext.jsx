import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { createPatientService } from "../../services/api";
import { createAuthConnector } from "../../services/http/apiConnector";

// Fonction pour décoder un token JWT sans bibliothèque
const decodeJWT = (token) => {
  if (!token) return null;
  try {
    // Le token a trois parties séparées par un point
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Décoder la partie payload (deuxième partie)
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload;
  } catch (e) {
    console.error("Erreur lors du décodage du token:", e);
    return null;
  }
};

// Créer un contexte pour les patients
const PatientContext = createContext(null);

export const PatientProvider = ({ children }) => {
  const [patientProfile, setPatientProfile] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, accessToken, refreshToken } = useAuth();

  // Afficher tous les détails sur l'utilisateur connecté et décoder le token
  useEffect(() => {
    console.log(
      "[PatientContext] Informations complètes sur l'utilisateur connecté:",
      {
        user: currentUser,
        hasToken: !!accessToken,
        tokenPrefix: accessToken ? accessToken.substring(0, 10) + "..." : null,
      }
    );

    if (accessToken) {
      const decodedToken = decodeJWT(accessToken);
      console.log("[PatientContext] Contenu du token décodé:", decodedToken);

      // Vérifier si le rôle dans le token correspond au rôle de l'utilisateur
      if (currentUser && decodedToken) {
        if (currentUser.role !== decodedToken.role) {
          console.error(
            "[PatientContext] ATTENTION: Le rôle dans le token ne correspond pas au rôle de l'utilisateur",
            {
              userRole: currentUser.role,
              tokenRole: decodedToken.role,
            }
          );
        } else {
          console.log(
            "[PatientContext] Le rôle dans le token correspond bien au rôle de l'utilisateur:",
            decodedToken.role
          );
        }
      }
    }
  }, [currentUser, accessToken]);

  // Créer une instance authentifiée d'API pour les appels patients
  const authConnector = createAuthConnector({
    accessToken,
    refreshToken,
    onTokenRefreshed: (newToken) => {
      console.log(
        "[PatientContext] Token rafraîchi:",
        newToken.substring(0, 10) + "..."
      );
      localStorage.setItem("accessToken", newToken);
    },
    onSessionExpired: () => {
      console.log("[PatientContext] Session expirée, redirection...");
      window.location.href = "/session-expired";
    },
  });

  // Créer une instance du service patient avec la connexion authentifiée
  const patientService = createPatientService(authConnector);

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
  }, [currentUser, accessToken]);

  // Mettre à jour le profil patient
  const updatePatientProfile = async (patientData) => {
    if (!currentUser) return null;

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
    if (!currentUser || !accessToken) {
      console.log(
        "[PatientContext] refreshMedicalInfo: Pas d'utilisateur ou de token"
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
