import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useAppContext } from "./AppContext";
import { usePatientContext } from "./patient/PatientContext";
import { httpService } from "../services/http"; // ✅ Utilisation directe
import { createAppointmentService } from "../services/api";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appointmentService, setAppointmentService] = useState(null);

  const { currentUser } = useAuth(); // ✅ Plus besoin de accessToken ni setAccessToken
  const { isPatient, isDoctor } = useAppContext();
  const { patientProfile } = usePatientContext();

  // Créer l'instance du service - SIMPLIFIÉ
  useEffect(() => {
    // ✅ Utilisation directe de httpService - le refresh est automatique
    setAppointmentService(createAppointmentService(httpService));
  }, []); // ✅ Plus de dépendance sur accessToken

  // Charger les rendez-vous de l'utilisateur connecté
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser || !appointmentService) {
        console.log("[AppointmentContext] Conditions non remplies:", {
          hasCurrentUser: !!currentUser,
          hasAppointmentService: !!appointmentService,
        });
        return;
      }

      console.log(
        "[AppointmentContext] Tentative de chargement des rendez-vous:",
        {
          isPatient,
          isDoctor,
          hasPatientProfile: !!patientProfile,
          patientProfileId: patientProfile?.id,
          currentUserId: currentUser.id,
        }
      );

      try {
        setLoading(true);
        setError(null);

        let response = [];

        // Récupérer les rendez-vous selon le rôle
        if (isPatient && patientProfile) {
          const patientId = patientProfile.utilisateur_id;
          if (!patientId) {
            console.error(
              "[AppointmentContext] ERREUR: patientProfile.utilisateur_id est manquant ! Profil:",
              patientProfile
            );
            setError(
              "Impossible de récupérer l'identifiant du patient (utilisateur_id manquant)"
            );
            return;
          }
          console.log(
            `[AppointmentContext] Récupération des rendez-vous du patient #${patientId}`
          );
          // Récupérer les rendez-vous du patient
          response = await appointmentService.getPatientAppointments(patientId);
          console.log(
            `[AppointmentContext] ${response.length} rendez-vous récupérés pour le patient`
          );
        } else if (isDoctor) {
          console.log(
            `[AppointmentContext] Récupération des rendez-vous du médecin #${currentUser.id}`
          );
          // Récupérer les rendez-vous du médecin
          response = await appointmentService.getDoctorAppointments(
            currentUser.id
          );
          console.log(
            `[AppointmentContext] ${response.length} rendez-vous récupérés pour le médecin`
          );
        } else {
          console.log(
            "[AppointmentContext] Conditions non remplies pour charger les rendez-vous"
          );
          return;
        }

        // Fonction utilitaire pour formater la date et l'heure en français
        function formatDateTimeFr(dateStr, heureStr) {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "";
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          let time = heureStr ? heureStr.substring(0, 5) : "";
          return `${day}/${month}/${year}${time ? " à " + time : ""}`;
        }

        // Transformer les données pour correspondre au format attendu par l'interface
        const formattedAppointments = response.map((appointment) => {
          // Log pour debug
          console.log(
            "[AppointmentContext] Traitement du rendez-vous:",
            appointment
          );

          // Correction du timestamp
          let timestamp = Date.now();
          if (appointment.date) {
            if (appointment.date.includes("T")) {
              // Format ISO, on utilise directement
              const d = new Date(appointment.date);
              if (!isNaN(d.getTime())) timestamp = d.getTime();
              else
                console.warn(
                  "[AppointmentContext] Timestamp invalide pour:",
                  appointment
                );
            } else if (appointment.heure) {
              // Format YYYY-MM-DD + heure séparée
              const d = new Date(
                appointment.date + "T" + appointment.heure.substring(0, 5)
              );
              if (!isNaN(d.getTime())) timestamp = d.getTime();
              else
                console.warn(
                  "[AppointmentContext] Timestamp invalide pour:",
                  appointment
                );
            } else {
              // Date seule
              const d = new Date(appointment.date);
              if (!isNaN(d.getTime())) timestamp = d.getTime();
              else
                console.warn(
                  "[AppointmentContext] Timestamp invalide pour:",
                  appointment
                );
            }
          } else {
            console.warn(
              "[AppointmentContext] Champ date manquant pour:",
              appointment
            );
          }

          // Correction du nom du médecin
          let doctorName = "Dr. Inconnu";
          if (appointment.medecin_nom || appointment.medecin_prenom) {
            doctorName = `Dr. ${appointment.medecin_prenom || ""} ${
              appointment.medecin_nom || ""
            }`.trim();
          }

          return {
            id: appointment.id?.toString() || "",
            title: appointment.motif || "Rendez-vous médical",
            date: formatDateTimeFr(appointment.date, appointment.heure),
            time:
              typeof appointment.heure === "string"
                ? appointment.heure.substring(0, 5)
                : "",
            doctor: {
              id: appointment.medecin_id,
              name: doctorName,
              specialty: appointment.specialite || "",
              address: appointment.adresse || "",
            },
            status: appointment.statut || "planifié",
            location: appointment.adresse || "Cabinet médical",
            description: appointment.motif || "Consultation médicale",
            timestamp,
            rawData: appointment,
          };
        });

        console.log(
          `[AppointmentContext] ${formattedAppointments.length} rendez-vous formatés:`,
          formattedAppointments
        );
        setAppointments(formattedAppointments);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous:", err);
        setError("Impossible de charger vos rendez-vous");
        // ✅ Plus besoin de gérer le refresh manuellement - httpService s'en charge
      } finally {
        setLoading(false);
      }
    };

    // Si nous avons déjà le profil patient ou si nous sommes médecin, charger les rendez-vous
    fetchAppointments();

    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(fetchAppointments, 30000);

    return () => clearInterval(interval);
  }, [currentUser, patientProfile, isPatient, isDoctor, appointmentService]); // ✅ Suppression d'accessToken des dépendances

  // Récupérer un rendez-vous par son ID
  const getAppointmentById = async (appointmentId) => {
    console.log(
      `[AppointmentContext] Récupération du rendez-vous #${appointmentId}`
    );

    if (!currentUser) {
      console.error("[AppointmentContext] Erreur: utilisateur non connecté");
      setError("Vous devez être connecté pour accéder à ce rendez-vous");
      return null;
    }

    // Vérifier d'abord si le rendez-vous est déjà dans la liste locale
    const localAppointment = appointments.find(
      (appt) => appt.id === appointmentId || appt.id === String(appointmentId)
    );

    if (localAppointment) {
      console.log(
        `[AppointmentContext] Rendez-vous #${appointmentId} trouvé localement`
      );
      return localAppointment;
    }

    // Si non trouvé localement, essayer de le récupérer depuis l'API
    try {
      setLoading(true);
      setError(null);
      console.log(
        `[AppointmentContext] Récupération du rendez-vous #${appointmentId} depuis l'API`
      );

      const response = await appointmentService.getAppointmentById(
        appointmentId
      );

      if (!response) {
        console.log(
          `[AppointmentContext] Rendez-vous #${appointmentId} non trouvé`
        );
        return null;
      }

      // Formater les données du rendez-vous
      const formattedAppointment = {
        id: response.id.toString(),
        title: response.motif || "Rendez-vous médical",
        date: response.date,
        time: response.heure,
        doctor: {
          id: response.medecin_id,
          name: response.medecin_nom
            ? `Dr. ${response.medecin_prenom || ""} ${
                response.medecin_nom || ""
              }`.trim()
            : "Dr. Inconnu",
          specialty: response.specialite || "",
          address: response.adresse || "",
        },
        status: response.statut,
        location: response.adresse || "Cabinet médical",
        description: response.motif || "Consultation médicale",
        timestamp: new Date(response.date + "T" + response.heure).getTime(),
        rawData: response,
      };

      console.log(
        `[AppointmentContext] Rendez-vous #${appointmentId} récupéré:`,
        formattedAppointment
      );

      // Ajouter à la liste locale si pas déjà présent
      setAppointments((prev) => {
        if (!prev.some((appt) => appt.id === formattedAppointment.id)) {
          return [...prev, formattedAppointment];
        }
        return prev;
      });

      return formattedAppointment;
    } catch (err) {
      console.error(
        `[AppointmentContext] Erreur lors de la récupération du rendez-vous #${appointmentId}:`,
        err
      );
      setError("Impossible de récupérer les détails du rendez-vous");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un rendez-vous
  const selectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // Ajouter un nouveau rendez-vous
  const addAppointment = async (appointmentData) => {
    console.log("[AppointmentContext] Début addAppointment", {
      currentUser,
      patientProfile,
      appointmentData,
    });

    if (!currentUser) {
      console.error("[AppointmentContext] Erreur: utilisateur non connecté");
      setError("Vous devez être connecté pour prendre un rendez-vous");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Préparer les données pour l'API
      const apiData = {
        patient_id: currentUser.id, // Toujours utiliser currentUser.id
        medecin_id: appointmentData.doctorId,
        date: appointmentData.date,
        heure: appointmentData.time,
        duree: 30, // Durée par défaut en minutes
        motif: appointmentData.motif || "Consultation",
        adresse: appointmentData.location || null,
      };

      console.log(
        "[AppointmentContext] Données envoyées pour création RDV:",
        apiData
      );

      // Créer le rendez-vous via l'API
      console.log(
        "[AppointmentContext] Appel au service appointmentService.createAppointment"
      );
      const response = await appointmentService.createAppointment(apiData);

      console.log("[AppointmentContext] Réponse création RDV:", response);

      // Ajouter le rendez-vous à la liste locale
      const newAppointment = {
        id: response.id.toString(),
        title: response.motif || "Rendez-vous médical",
        date: response.date,
        time: response.heure,
        doctor: {
          id: response.medecin_id,
          name: appointmentData.doctor?.name || "Dr. Inconnu",
          specialty: appointmentData.doctor?.specialty || "",
          address: appointmentData.doctor?.address || "",
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
      console.error(
        "[AppointmentContext] Erreur détaillée lors de la création du rendez-vous:",
        err
      );
      console.error("[AppointmentContext] Message d'erreur:", err.message);
      console.error(
        "[AppointmentContext] Réponse d'erreur:",
        err.response?.data
      );
      setError(
        "Impossible de créer le rendez-vous: " +
          (err.response?.data?.message || err.message)
      );
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

  // Supprimer un rendez-vous
  const deleteAppointment = async (appointmentId) => {
    if (!currentUser) {
      setError("Vous devez être connecté pour supprimer un rendez-vous");
      return false;
    }
    try {
      setLoading(true);
      setError(null);
      await appointmentService.deleteAppointment(appointmentId);
      setAppointments((prev) =>
        prev.filter(
          (app) => app.id !== appointmentId && app.id !== String(appointmentId)
        )
      );
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du rendez-vous:", err);
      setError("Impossible de supprimer le rendez-vous");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les rendez-vous à venir et passés
  const getUpcomingAppointments = () => {
    return appointments
      .filter((app) => app.status === "planifié")
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const getPastAppointments = () => {
    return appointments
      .filter((app) => app.status === "terminé")
      .sort((a, b) => b.timestamp - a.timestamp); // Plus récents en premier
  };

  // Forcer l'actualisation des rendez-vous
  const refreshAppointments = async () => {
    console.log("[AppointmentContext] Actualisation forcée des rendez-vous");
    if (!currentUser || !appointmentService) {
      console.log("[AppointmentContext] Impossible d'actualiser - conditions non remplies");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response = [];

      // Récupérer les rendez-vous selon le rôle
      if (isPatient && patientProfile) {
        const patientId = patientProfile.utilisateur_id;
        if (!patientId) {
          console.error("[AppointmentContext] ERREUR: patientProfile.utilisateur_id est manquant !");
          setError("Impossible de récupérer l'identifiant du patient");
          return;
        }
        console.log(`[AppointmentContext] Actualisation des rendez-vous du patient #${patientId}`);
        response = await appointmentService.getPatientAppointments(patientId);
      } else if (isDoctor) {
        console.log(`[AppointmentContext] Actualisation des rendez-vous du médecin #${currentUser.id}`);
        response = await appointmentService.getDoctorAppointments(currentUser.id);
      } else {
        console.log("[AppointmentContext] Conditions non remplies pour actualiser");
        return;
      }

      // Transformer les données (même logique que dans useEffect)
      const formattedAppointments = response.map((appointment) => {
        let timestamp = Date.now();
        if (appointment.date) {
          if (appointment.date.includes("T")) {
            const d = new Date(appointment.date);
            if (!isNaN(d.getTime())) timestamp = d.getTime();
          } else if (appointment.heure) {
            const d = new Date(appointment.date + "T" + appointment.heure.substring(0, 5));
            if (!isNaN(d.getTime())) timestamp = d.getTime();
          } else {
            const d = new Date(appointment.date);
            if (!isNaN(d.getTime())) timestamp = d.getTime();
          }
        }

        let doctorName = "Dr. Inconnu";
        if (appointment.medecin_nom || appointment.medecin_prenom) {
          doctorName = `Dr. ${appointment.medecin_prenom || ""} ${appointment.medecin_nom || ""}`.trim();
        }

        return {
          id: appointment.id?.toString() || "",
          title: appointment.motif || "Rendez-vous médical",
          date: appointment.date ? new Date(appointment.date).toLocaleDateString("fr-FR") + (appointment.heure ? " à " + appointment.heure.substring(0, 5) : "") : "",
          time: typeof appointment.heure === "string" ? appointment.heure.substring(0, 5) : "",
          doctor: {
            id: appointment.medecin_id,
            name: doctorName,
            specialty: appointment.specialite || "",
            address: appointment.adresse || "",
          },
          status: appointment.statut || "planifié",
          location: appointment.adresse || "Cabinet médical",
          description: appointment.motif || "Consultation médicale",
          timestamp,
          rawData: appointment,
        };
      });

      console.log(`[AppointmentContext] ${formattedAppointments.length} rendez-vous actualisés`);
      setAppointments(formattedAppointments);
    } catch (err) {
      console.error("Erreur lors de l'actualisation des rendez-vous:", err);
      setError("Impossible d'actualiser vos rendez-vous");
    } finally {
      setLoading(false);
    }
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
    deleteAppointment,
    getUpcomingAppointments,
    getPastAppointments,
    getAppointmentById,
    refreshAppointments, // ✅ Nouvelle fonction d'actualisation
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAppointmentContext = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointmentContext doit être utilisé avec un AppointmentProvider"
    );
  }
  return context;
};
