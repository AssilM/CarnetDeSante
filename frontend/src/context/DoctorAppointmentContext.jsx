import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { createAppointmentService } from "../services/api";
import { httpService } from "../services/http";

// Créer une instance du service de rendez-vous
const appointmentService = createAppointmentService(httpService);

// Créer un contexte pour les rendez-vous des médecins
const DoctorAppointmentContext = createContext(null);

export const DoctorAppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser, accessToken } = useAuth();

  // Charger les rendez-vous du médecin connecté
  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      if (!currentUser || currentUser.role !== "medecin") return;

      try {
        setLoading(true);
        setError(null);

        // Récupérer les rendez-vous du médecin
        const response = await appointmentService.getDoctorAppointments(
          currentUser.id
        );

        // Transformer les données pour correspondre au format attendu par l'interface
        const formattedAppointments = response.map((appointment) => ({
          id: appointment.id.toString(),
          title: appointment.motif || `Rendez-vous médical`,
          date: formatDateForDisplay(appointment.date),
          time: formatTimeForDisplay(appointment.heure),
          patient: {
            id: appointment.patient_id,
            name: appointment.patient_nom || "Patient",
          },
          status: appointment.statut,
          location: appointment.adresse || "Cabinet médical",
          description: appointment.motif || "Consultation médicale",
          timestamp: new Date(
            appointment.date + "T" + appointment.heure
          ).getTime(),
          rawData: appointment, // Conserver les données brutes si nécessaire
        }));

        setAppointments(formattedAppointments);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous:", err);
        setError("Impossible de charger vos rendez-vous");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAppointments();
  }, [currentUser, accessToken]);

  // Formater une date pour l'affichage (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Formater une heure pour l'affichage (HH:MM:SS -> HH:MM)
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
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

      // Créer le rendez-vous via l'API
      const response = await appointmentService.createAppointment(apiData);

      // Ajouter le rendez-vous à la liste locale
      const newAppointment = {
        id: response.id.toString(),
        title: response.motif || "Rendez-vous médical",
        date: formatDateForDisplay(response.date),
        time: formatTimeForDisplay(response.heure),
        patient: {
          id: response.patient_id,
          name: appointmentData.patient?.name || "Patient",
        },
        status: response.statut,
        location: response.adresse || "Cabinet médical",
        description: response.motif || "Consultation médicale",
        timestamp: new Date(response.date + "T" + response.heure).getTime(),
        rawData: response,
      };

      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      console.error("Erreur lors de la création du rendez-vous:", err);
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
      console.error("Erreur lors de l'annulation du rendez-vous:", err);
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
