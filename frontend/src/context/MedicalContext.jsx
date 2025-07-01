import React from "react";
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

// Provider qui regroupe tous les providers médicaux
export const MedicalProvider = ({ children }) => (
  <MedicalInfoProvider>
    <MedicalHistoryProvider>
      <AllergyProvider>
        <HealthEventProvider>{children}</HealthEventProvider>
      </AllergyProvider>
    </MedicalHistoryProvider>
  </MedicalInfoProvider>
);

// Hook combiné pour accéder à tous les contextes médicaux
export const useMedicalContext = () => {
  const medicalInfo = useMedicalInfoContext();
  const medicalHistory = useMedicalHistoryContext();
  const allergy = useAllergyContext();
  const healthEvent = useHealthEventContext();

  return {
    medicalInfo,
    medicalHistory,
    allergy,
    healthEvent,
  };
};
