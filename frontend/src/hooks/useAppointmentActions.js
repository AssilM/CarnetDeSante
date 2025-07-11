import { useState } from "react";
import { useDoctorAppointmentContext } from "../context";
import { useAppContext } from "../context/AppContext";

export const useAppointmentActions = () => {
  const { cancelAppointment, startAppointment, finishAppointment } =
    useDoctorAppointmentContext();
  const { showNotification } = useAppContext();

  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancel = async (appointmentId) => {
    if (!appointmentId) return;

    setCancelLoading(true);
    try {
      await cancelAppointment(appointmentId);
      showNotification({
        type: "success",
        message: "Rendez-vous annulé avec succès !",
      });
      return true;
    } catch {
      showNotification({
        type: "error",
        message: "Erreur lors de l'annulation du rendez-vous",
      });
      return false;
    } finally {
      setCancelLoading(false);
    }
  };

  const handleStartAppointment = async (appointmentId) => {
    setActionLoading(true);
    try {
      const success = await startAppointment(appointmentId);
      if (success) {
        showNotification({
          type: "success",
          message: "Rendez-vous démarré avec succès !",
        });
      } else {
        showNotification({
          type: "error",
          message: "Erreur lors du démarrage du rendez-vous",
        });
      }
      return success;
    } catch (error) {
      console.error("Erreur lors du démarrage du rendez-vous:", error);
      showNotification({
        type: "error",
        message: "Erreur lors du démarrage du rendez-vous",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishAppointment = async (appointmentId) => {
    setActionLoading(true);
    try {
      const success = await finishAppointment(appointmentId);
      if (success) {
        showNotification({
          type: "success",
          message: "Rendez-vous terminé avec succès !",
        });
        return true;
      } else {
        showNotification({
          type: "error",
          message: "Erreur lors de la finalisation du rendez-vous",
        });
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la finalisation du rendez-vous:", error);
      showNotification({
        type: "error",
        message: "Erreur lors de la finalisation du rendez-vous",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    handleCancel,
    handleStartAppointment,
    handleFinishAppointment,
    cancelLoading,
    actionLoading,
  };
};
