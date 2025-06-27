import React from "react";
import {
  DocumentProvider,
  VaccinationProvider,
  MedicalProvider,
  AppointmentProvider,
  DoctorProvider,
  PatientProvider,
} from "../../context";

/**
 * Providers spécifiques aux fonctionnalités patient
 * Contient tous les contextes nécessaires pour les fonctionnalités patient
 */
const PatientProviders = ({ children }) => {
  return (
    <PatientProvider>
      <DocumentProvider>
        <VaccinationProvider>
          <MedicalProvider>
            <AppointmentProvider>
              <DoctorProvider>{children}</DoctorProvider>
            </AppointmentProvider>
          </MedicalProvider>
        </VaccinationProvider>
      </DocumentProvider>
    </PatientProvider>
  );
};

export default PatientProviders;
