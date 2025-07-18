import React from "react";
import {
  DoctorProvider,
  DocumentProvider,
  DoctorAppointmentProvider,
  DoctorAvailabilityProvider,
} from "../../context";

/**
 * Providers spécifiques aux fonctionnalités des médecins
 * Contient les contextes nécessaires pour les médecins uniquement
 */
const DoctorProviders = ({ children }) => {
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

export default DoctorProviders;
