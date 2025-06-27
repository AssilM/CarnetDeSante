import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import DoctorApi from "./api/DoctorApi";

// Créer un contexte pour les médecins
const DoctorContext = createContext(null);

export const DoctorProvider = ({ children }) => {
  // État pour stocker la liste des médecins
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const { currentUser, accessToken } = useAuth();

  // État pour stocker les spécialités disponibles
  const [specialties] = useState([
    "Médecin généraliste",
    "Dermatologue",
    "Cardiologue",
    "Pédiatre",
    "Ophtalmologue",
    "Gynécologue",
    "Dentiste",
    "ORL",
    "Rhumatologue",
    "Psychiatre",
  ]);

  // État pour le médecin actuellement sélectionné
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // État pour la date et le créneau sélectionnés
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Fonction pour charger les médecins (appelée manuellement)
  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DoctorApi.getAllDoctors();
      setDoctors(response.medecins || []);
      return response.medecins || [];
    } catch (err) {
      console.error("Erreur lors du chargement des médecins:", err);
      setError("Impossible de charger la liste des médecins");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Charger le profil du médecin si l'utilisateur est connecté en tant que médecin
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!currentUser || currentUser.role !== "medecin") {
        return;
      }

      try {
        setLoading(true);
        const profileData = await DoctorApi.getProfile(
          currentUser.id,
          accessToken
        );
        setDoctorProfile(profileData.medecin);
      } catch (err) {
        console.error("Erreur lors du chargement du profil médecin:", err);
        setError("Impossible de charger votre profil médecin");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [currentUser, accessToken]);

  // Fonctions pour filtrer les médecins
  const getDoctorsBySpecialty = async (specialty) => {
    try {
      setLoading(true);
      const response = await DoctorApi.getDoctorsBySpecialty(specialty);
      return response.medecins || [];
    } catch (err) {
      console.error("Erreur lors de la recherche par spécialité:", err);
      setError("Impossible de trouver des médecins pour cette spécialité");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchDoctors = (query) => {
    if (!query) return doctors;

    const searchTerm = query.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.nom?.toLowerCase().includes(searchTerm) ||
        doctor.prenom?.toLowerCase().includes(searchTerm) ||
        doctor.specialite?.toLowerCase().includes(searchTerm)
    );
  };

  // Fonction pour obtenir les créneaux disponibles d'un médecin à une date donnée
  const getAvailableSlots = async (doctorId, date) => {
    // Cette fonction devrait être implémentée pour appeler l'API
    // Pour l'instant, on retourne des données fictives
    const doctor = doctors.find((doc) => doc.id === doctorId);
    if (!doctor) return [];

    const daySlots = doctor.availableSlots?.find((slot) => slot.date === date);
    return daySlots ? daySlots.slots : [];
  };

  // Fonction pour réserver un créneau
  const bookAppointment = async (appointment) => {
    // Cette fonction devrait être implémentée pour appeler l'API
    // Pour l'instant, on simule une réservation réussie
    return true;
  };

  // Créer un profil médecin lors de l'inscription
  const createDoctorProfile = async (userId, doctorData, token) => {
    try {
      const response = await DoctorApi.createOrUpdateProfile(
        userId,
        doctorData,
        token
      );
      return response;
    } catch (error) {
      console.error("Erreur lors de la création du profil médecin:", error);
      throw error;
    }
  };

  // Mettre à jour le profil médecin
  const updateDoctorProfile = async (doctorData) => {
    if (!currentUser) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await DoctorApi.createOrUpdateProfile(
        currentUser.id,
        doctorData,
        accessToken
      );
      setDoctorProfile(response.medecin);
      return response.medecin;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil médecin:", error);
      setError("Impossible de mettre à jour votre profil");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valeurs exposées par le contexte
  const value = {
    doctors,
    loading,
    error,
    specialties,
    selectedDoctor,
    setSelectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    getDoctorsBySpecialty,
    searchDoctors,
    getAvailableSlots,
    bookAppointment,
    doctorProfile,
    createDoctorProfile,
    updateDoctorProfile,
    loadDoctors,
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useDoctorContext = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error(
      "useDoctorContext doit être utilisé avec un DoctorProvider"
    );
  }
  return context;
};
