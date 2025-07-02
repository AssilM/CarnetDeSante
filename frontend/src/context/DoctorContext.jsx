import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { createDoctorService } from "../services/api";
import { createAuthConnector } from "../services/http";

// Créer un contexte pour les médecins
const DoctorContext = createContext(null);

export const DoctorProvider = ({ children }) => {
  // État pour stocker la liste des médecins
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const { currentUser, accessToken, testExpireToken } = useAuth();

  // Créer une instance du service docteur
  const [doctorService, setDoctorService] = useState(null);

  // Initialiser l'API authentifiée lorsque le token change
  useEffect(() => {
    if (accessToken) {
      console.log("[DoctorContext] Création d'une API authentifiée");
      const authenticatedApi = createAuthConnector({
        accessToken,
        onSessionExpired: testExpireToken,
      });
      setDoctorService(createDoctorService(authenticatedApi));
    } else {
      setDoctorService(null);
    }
  }, [accessToken, testExpireToken]);

  // État pour stocker les spécialités disponibles
  const [specialties, setSpecialties] = useState([]);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // État pour le médecin actuellement sélectionné
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // État pour la date et le créneau sélectionnés
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});

  // Fonction pour charger les médecins
  const loadDoctors = useCallback(async () => {
    if (loading || !doctorService) return [];

    try {
      setLoading(true);
      setError(null);
      console.log("[DoctorContext] Chargement des médecins");
      const response = await doctorService.getAllDoctors();
      console.log("[DoctorContext] Médecins chargés:", response);

      const medecinsList = Array.isArray(response)
        ? response
        : response.medecins || [];
      setDoctors(medecinsList);

      // Extraire les spécialités uniques
      if (medecinsList.length > 0) {
        const uniqueSpecialties = [
          ...new Set(medecinsList.map((doc) => doc.specialite)),
        ].filter(Boolean);
        setSpecialties(uniqueSpecialties);
      }

      setHasLoadedInitialData(true);
      return medecinsList;
    } catch (err) {
      console.error(
        "[DoctorContext] Erreur lors du chargement des médecins:",
        err
      );
      setError("Impossible de charger la liste des médecins");
      return [];
    } finally {
      setLoading(false);
    }
  }, [loading, doctorService]);

  // Charger le profil du médecin si l'utilisateur est connecté en tant que médecin
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!currentUser || currentUser.role !== "medecin" || !doctorService) {
        return;
      }

      try {
        setLoading(true);
        console.log("[DoctorContext] Chargement du profil médecin");
        const profileData = await doctorService.getDoctorProfile();
        console.log("[DoctorContext] Profil médecin chargé:", profileData);
        setDoctorProfile(profileData.medecin);
      } catch (err) {
        console.error(
          "[DoctorContext] Erreur lors du chargement du profil médecin:",
          err
        );
        setError("Impossible de charger votre profil médecin");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [currentUser, doctorService]);

  // Charger la liste des spécialités au démarrage
  useEffect(() => {
    // Charger les données seulement une fois au démarrage et si le service est disponible
    if (!hasLoadedInitialData && !loading && doctorService) {
      loadDoctors();
    }
  }, [hasLoadedInitialData, loadDoctors, loading, doctorService]);

  // Fonctions pour filtrer les médecins
  const getDoctorsBySpecialty = useCallback(
    async (specialty) => {
      if (!doctorService) return [];

      try {
        setLoading(true);
        const response = await doctorService.getDoctorsBySpecialty(specialty);
        return response.medecins || [];
      } catch (err) {
        console.error(
          "[DoctorContext] Erreur lors de la recherche par spécialité:",
          err
        );
        setError("Impossible de trouver des médecins pour cette spécialité");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [doctorService]
  );

  const searchDoctors = useCallback(
    (query) => {
      if (!query) return doctors;

      const searchTerm = query.toLowerCase();
      return doctors.filter(
        (doctor) =>
          doctor.nom?.toLowerCase().includes(searchTerm) ||
          doctor.prenom?.toLowerCase().includes(searchTerm) ||
          doctor.specialite?.toLowerCase().includes(searchTerm)
      );
    },
    [doctors]
  );

  // Fonction pour obtenir les créneaux disponibles d'un médecin à une date donnée
  const getAvailableSlots = useCallback(
    async (doctorId, date) => {
      if (!doctorService) return [];

      const cacheKey = `${doctorId}-${date}`;

      // Vérifier si les créneaux sont déjà en cache
      if (availableSlots[cacheKey]) {
        return availableSlots[cacheKey];
      }

      try {
        setLoading(true);
        setError(null);

        const response = await doctorService.getAvailableSlots(doctorId, date);
        const slots = response.creneaux || [];

        // Mettre en cache les créneaux
        setAvailableSlots((prev) => ({
          ...prev,
          [cacheKey]: slots,
        }));

        return slots;
      } catch (err) {
        console.error(
          "[DoctorContext] Erreur lors de la récupération des créneaux disponibles:",
          err
        );
        setError("Impossible de récupérer les créneaux disponibles");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [availableSlots, doctorService]
  );

  // Réinitialiser la sélection
  const resetSelection = useCallback(() => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
  }, []);

  // Créer un profil médecin lors de l'inscription
  const createDoctorProfile = async (userId, doctorData) => {
    if (!doctorService) return null;

    try {
      const response = await doctorService.createOrUpdateDoctorProfile(
        userId,
        doctorData
      );
      return response;
    } catch (error) {
      console.error(
        "[DoctorContext] Erreur lors de la création du profil médecin:",
        error
      );
      throw error;
    }
  };

  // Mettre à jour le profil médecin
  const updateDoctorProfile = async (doctorData) => {
    if (!currentUser || !doctorService) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.createOrUpdateDoctorProfile(
        currentUser.id,
        doctorData
      );
      setDoctorProfile(response.medecin);
      return response.medecin;
    } catch (error) {
      console.error(
        "[DoctorContext] Erreur lors de la mise à jour du profil médecin:",
        error
      );
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
    resetSelection,
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
