import { createItemContext } from "./ItemContext";

// Créer le contexte spécifique aux rendez-vous
const { Provider, useItemContext } = createItemContext("Appointment");

export const AppointmentProvider = Provider;
export const useAppointmentContext = useItemContext;
