import { createItemContext } from "./ItemContext";

// Créer un contexte spécifique pour le profil médical
export const {
  Provider: MedicalInfoProvider,
  useItemContext: useMedicalInfoContext,
} = createItemContext("MedicalInfo");

// Créer un contexte spécifique pour les antécédents médicaux
export const {
  Provider: MedicalHistoryProvider,
  useItemContext: useMedicalHistoryContext,
} = createItemContext("MedicalHistory");

// Créer un contexte spécifique pour les allergies
export const { Provider: AllergyProvider, useItemContext: useAllergyContext } =
  createItemContext("Allergy");

// Créer un contexte spécifique pour les événements de santé
export const {
  Provider: HealthEventProvider,
  useItemContext: useHealthEventContext,
} = createItemContext("HealthEvent");
