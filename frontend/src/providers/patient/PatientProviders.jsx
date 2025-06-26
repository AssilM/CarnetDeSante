import React from "react";
import {
  DocumentProvider,
  VaccinationProvider,
  MedicalInfoProvider,
  MedicalHistoryProvider,
  AllergyProvider,
  HealthEventProvider,
  AppointmentProvider,
  DoctorProvider,
} from "../../context";

/**
 * Providers spécifiques aux fonctionnalités patient
 * Contient tous les contextes nécessaires pour les fonctionnalités patient
 */
const PatientProviders = ({ children }) => {
  return (
    <DocumentProvider>
      <VaccinationProvider>
        <MedicalInfoProvider>
          <MedicalHistoryProvider>
            <AllergyProvider>
              <HealthEventProvider>
                <AppointmentProvider>
                  <DoctorProvider>{children}</DoctorProvider>
                </AppointmentProvider>
              </HealthEventProvider>
            </AllergyProvider>
          </MedicalHistoryProvider>
        </MedicalInfoProvider>
      </VaccinationProvider>
    </DocumentProvider>
  );
};

export default PatientProviders;
