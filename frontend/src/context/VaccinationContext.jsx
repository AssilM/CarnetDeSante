import { createItemContext } from "./ItemContext";

// Créer le contexte spécifique aux vaccinations
const { Provider, useItemContext } = createItemContext("Vaccination");

export const VaccinationProvider = Provider;
export const useVaccinationContext = useItemContext;
