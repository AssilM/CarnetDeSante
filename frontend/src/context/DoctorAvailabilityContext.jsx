import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { createDoctorService } from "../services/api";
import { httpService } from "../services/http";

// Créer un contexte pour les disponibilités des médecins
const DoctorAvailabilityContext = createContext(null);

// Jours de la semaine en français
const DAYS_OF_WEEK = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

export const DoctorAvailabilityProvider = ({ children }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorService, setDoctorService] = useState(null);

  const { currentUser } = useAuth(); // ✅ Simplifié

  // ✅ Créer l'instance du service - SIMPLIFIÉ
  useEffect(() => {
    // ✅ Utilisation directe de httpService - le refresh est automatique
    setDoctorService(createDoctorService(httpService));
  }, []); // ✅ Plus de dépendances complexes

  // Charger les disponibilités du médecin connecté
  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!currentUser || currentUser.role !== "medecin" || !doctorService) {
        console.log("[DoctorAvailabilityContext] Conditions non remplies:", {
          hasCurrentUser: !!currentUser,
          isDoctor: currentUser?.role === "medecin",
          hasDoctorService: !!doctorService,
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await doctorService.getDoctorAvailability(
          currentUser.id
        );
        setAvailabilities(response);
      } catch (err) {
        console.error("Erreur lors du chargement des disponibilités:", err);
        setError("Impossible de charger vos disponibilités");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilities();
  }, [currentUser, doctorService]);

  // Ajouter une nouvelle disponibilité
  const addAvailability = async (availabilityData) => {
    if (!currentUser || !doctorService) {
      setError("Vous devez être connecté pour ajouter une disponibilité");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.createAvailability(
        currentUser.id,
        availabilityData
      );
      setAvailabilities((prev) => [...prev, response]);
      return response;
    } catch (err) {
      console.error("Erreur lors de l'ajout de la disponibilité:", err);
      setError("Impossible d'ajouter la disponibilité");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une disponibilité existante
  const updateAvailability = async (availabilityId, availabilityData) => {
    if (!currentUser || !doctorService) {
      setError("Vous devez être connecté pour modifier une disponibilité");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.updateAvailability(
        availabilityId,
        availabilityData
      );
      setAvailabilities((prev) =>
        prev.map((avail) => (avail.id === availabilityId ? response : avail))
      );
      return response;
    } catch (err) {
      console.error("Erreur lors de la modification de la disponibilité:", err);
      setError("Impossible de modifier la disponibilité");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une disponibilité
  const deleteAvailability = async (availabilityId) => {
    if (!currentUser || !doctorService) {
      setError("Vous devez être connecté pour supprimer une disponibilité");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await doctorService.deleteAvailability(availabilityId);
      setAvailabilities((prev) =>
        prev.filter((avail) => avail.id !== availabilityId)
      );
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de la disponibilité:", err);
      setError("Impossible de supprimer la disponibilité");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les disponibilités par jour
  const getAvailabilitiesByDay = () => {
    const availabilitiesByDay = {};

    DAYS_OF_WEEK.forEach((day) => {
      availabilitiesByDay[day] = availabilities.filter(
        (avail) => avail.jour === day
      );
    });

    return availabilitiesByDay;
  };

  // Valeurs exposées par le contexte
  const value = {
    availabilities,
    loading,
    error,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    getAvailabilitiesByDay,
    DAYS_OF_WEEK,
  };

  return (
    <DoctorAvailabilityContext.Provider value={value}>
      {children}
    </DoctorAvailabilityContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useDoctorAvailability = () => {
  const context = useContext(DoctorAvailabilityContext);
  if (!context) {
    throw new Error(
      "useDoctorAvailability doit être utilisé avec un DoctorAvailabilityProvider"
    );
  }
  return context;
};
