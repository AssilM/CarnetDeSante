import React from "react";
import {
  DoctorProvider,
  DocumentProvider,
  DoctorAppointmentProvider,
  DoctorAvailabilityProvider,
} from "../../context";

/**
 * Providers spécifiques aux fonctionnalités du personnel médical et administratif
 * Contient les contextes nécessaires pour les médecins et administrateurs
 */
const StaffProviders = ({ children }) => {
  return (
    <DoctorProvider>
      <DocumentProvider>
        <DoctorAppointmentProvider>
          <DoctorAvailabilityProvider>{children}</DoctorAvailabilityProvider>
        </DoctorAppointmentProvider>
      </DocumentProvider>
    </DoctorProvider>
  );
};

export default StaffProviders;
