import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { createAppointmentService } from "../services/api";
import { httpService } from "../services/http";

// Créer un contexte pour les rendez-vous des médecins
const DoctorAppointmentContext = createContext(null);

export const DoctorAppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth(); // ✅ Simplifié

  // ✅ Créer l'instance du service avec useMemo pour éviter la re-création
  const appointmentService = useMemo(
    () => createAppointmentService(httpService),
    []
  );

  // ✅ Plus besoin de décoder le JWT - httpService gère tout automatiquement

  // Charger les rendez-vous du médecin connecté
  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      // ✅ Ne pas charger si on est sur la page session-expired
      if (
        typeof window !== "undefined" &&
        window.location.pathname.includes("/session-expired")
      ) {
        return;
      }

      if (
        !currentUser ||
        currentUser.role !== "medecin" ||
        !appointmentService
      ) {
        console.log("[DoctorAppointmentContext] Conditions non remplies:", {
          currentUser: currentUser?.role,
          userId: currentUser?.id,
          hasAppointmentService: !!appointmentService,
        });
        return;
      }

      // ✅ Plus besoin de vérifier le token - httpService gère tout automatiquement

      try {
        console.log(
          "[DoctorAppointmentContext] Début du chargement des rendez-vous pour le médecin:",
          currentUser.id
        );
        setLoading(true);
        setError(null);

        // Récupérer les rendez-vous du médecin
        const response = await appointmentService.getDoctorAppointments(
          currentUser.id
        );

        console.log(
          "[DoctorAppointmentContext] Réponse brute de l'API:",
          response
        );

        // Transformer les données pour correspondre au format attendu par l'interface
        const formattedAppointments = response.map((appointment) => {
          console.log(
            "[DoctorAppointmentContext] Traitement du rendez-vous:",
            appointment
          );

          // Générer un timestamp fiable à partir de la date et de l'heure
          let timestamp;
          try {
            let datePart = "";
            let heurePart = "";
            if (appointment.date) {
              // Si la date est déjà au format ISO, on prend la partie date uniquement
              datePart = appointment.date.split("T")[0];
            }
            if (appointment.heure) {
              // On prend HH:MM si possible
              heurePart = appointment.heure.substring(0, 5);
            }
            if (datePart && heurePart) {
              // Ajouter le fuseau horaire local pour éviter le décalage UTC
              const localDate = new Date(datePart + "T" + heurePart);
              const offset = localDate.getTimezoneOffset() * 60000;
              timestamp = localDate.getTime() + offset;
            } else if (appointment.date) {
              const localDate = new Date(appointment.date);
              const offset = localDate.getTimezoneOffset() * 60000;
              timestamp = localDate.getTime() + offset;
            } else {
              timestamp = Date.now();
            }
            if (isNaN(timestamp)) {
              console.warn(
                "[DoctorAppointmentContext] Timestamp NaN pour",
                appointment
              );
              timestamp = Date.now();
            }
          } catch {
            timestamp = Date.now();
          }

          // Extraire la date au format YYYY-MM-DD (locale) depuis la chaîne ISO
          let dateOnly = "";
          if (appointment.date) {
            try {
              const d = new Date(appointment.date);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              dateOnly = `${year}-${month}-${day}`;
            } catch {
              dateOnly = "";
            }
          }

          return {
            id: appointment.id.toString(),
            title: appointment.motif || `Rendez-vous médical`,
            date: formatDateForDisplay(appointment.date),
            time: formatTimeForDisplay(appointment.heure),
            dateRaw: appointment.date,
            dateOnly,
            patient: {
              id: appointment.patient_id,
              name:
                `${appointment.patient_nom || ""} ${
                  appointment.patient_prenom || ""
                }`.trim() || "Patient",
            },
            status: appointment.statut || "confirmé",
            location: appointment.adresse || "Cabinet médical",
            description: appointment.motif || "Consultation médicale",
            timestamp: timestamp,
            rawData: appointment, // Conserver les données brutes si nécessaire
          };
        });

        console.log(
          "[DoctorAppointmentContext] Rendez-vous formatés:",
          formattedAppointments
        );
        setAppointments(formattedAppointments);
      } catch (err) {
        console.error(
          "[DoctorAppointmentContext] Erreur lors du chargement des rendez-vous:",
          err
        );
        console.error("[DoctorAppointmentContext] Détails de l'erreur:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
        });

        if (err.response?.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
        } else if (err.response?.status === 404) {
          setError("Aucun rendez-vous trouvé pour ce médecin.");
        } else if (err.code === "ECONNREFUSED") {
          setError(
            "Impossible de se connecter au serveur. Vérifiez que le backend est démarré."
          );
        } else {
          setError(`Impossible de charger vos rendez-vous: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAppointments();
  }, [currentUser, appointmentService]); // Suppression d'accessToken des dépendances

  // Formater une date pour l'affichage (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error(
        "[DoctorAppointmentContext] Erreur lors du formatage de la date:",
        dateString,
        error
      );
      return dateString || "";
    }
  };

  // Formater une heure pour l'affichage (HH:MM:SS -> HH:MM)
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
    try {
      return timeString.substring(0, 5);
    } catch (error) {
      console.error(
        "[DoctorAppointmentContext] Erreur lors du formatage de l'heure:",
        timeString,
        error
      );
      return timeString || "";
    }
  };

  // Sélectionner un rendez-vous
  const selectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // Ajouter un nouveau rendez-vous
  const addAppointment = async (appointmentData) => {
    if (!currentUser) {
      setError("Vous devez être connecté pour créer un rendez-vous");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Préparer les données pour l'API
      const apiData = {
        patient_id: appointmentData.patientId,
        medecin_id: currentUser.id,
        date: appointmentData.date,
        heure: appointmentData.time,
        duree: 30, // Durée par défaut en minutes
        motif: appointmentData.title || "Consultation",
        adresse: appointmentData.location || null,
      };

      console.log(
        "[DoctorAppointmentContext] Création d'un nouveau rendez-vous:",
        apiData
      );

      // Créer le rendez-vous via l'API
      const response = await appointmentService.createAppointment(apiData);

      console.log(
        "[DoctorAppointmentContext] Rendez-vous créé avec succès:",
        response
      );

      // Ajouter le rendez-vous à la liste locale
      const newAppointment = {
        id: response.id.toString(),
        title: response.motif || "Rendez-vous médical",
        date: formatDateForDisplay(response.date),
        time: formatTimeForDisplay(response.heure),
        dateRaw: response.date,
        dateOnly: response.dateOnly,
        patient: {
          id: response.patient_id,
          name: appointmentData.patient?.name || "Patient",
        },
        status: response.statut,
        location: response.adresse || "Cabinet médical",
        description: response.motif || "Consultation médicale",
        timestamp: (() => {
          const localDate = new Date(response.date + "T" + response.heure);
          const offset = localDate.getTimezoneOffset() * 60000;
          return localDate.getTime() + offset;
        })(),
        rawData: response,
      };

      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      console.error(
        "[DoctorAppointmentContext] Erreur lors de la création du rendez-vous:",
        err
      );
      setError("Impossible de créer le rendez-vous");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Annuler un rendez-vous
  const cancelAppointment = async (appointmentId) => {
    if (!currentUser) {
      setError("Vous devez être connecté pour annuler un rendez-vous");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "[DoctorAppointmentContext] Annulation du rendez-vous:",
        appointmentId
      );

      // Annuler le rendez-vous via l'API
      await appointmentService.cancelAppointment(appointmentId);

      // Mettre à jour le statut du rendez-vous dans la liste locale
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status: "annulé" } : app
        )
      );

      return true;
    } catch (err) {
      console.error(
        "[DoctorAppointmentContext] Erreur lors de l'annulation du rendez-vous:",
        err
      );
      setError("Impossible d'annuler le rendez-vous");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les rendez-vous à venir et passés
  const getUpcomingAppointments = () => {
    const now = new Date().getTime();
    return appointments.filter(
      (app) => app.timestamp > now && app.status !== "annulé"
    );
  };

  const getPastAppointments = () => {
    const now = new Date().getTime();
    return appointments.filter(
      (app) => app.timestamp <= now || app.status === "annulé"
    );
  };

  // Valeurs exposées par le contexte
  const value = {
    appointments,
    selectedAppointment,
    loading,
    error,
    selectAppointment,
    addAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    getPastAppointments,
  };

  return (
    <DoctorAppointmentContext.Provider value={value}>
      {children}
    </DoctorAppointmentContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useDoctorAppointmentContext = () => {
  const context = useContext(DoctorAppointmentContext);
  if (!context) {
    throw new Error(
      "useDoctorAppointmentContext doit être utilisé avec un DoctorAppointmentProvider"
    );
  }
  return context;
};
