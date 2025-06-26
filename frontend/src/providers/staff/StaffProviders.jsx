import React from "react";
import {
  DoctorProvider,
  DocumentProvider,
  AppointmentProvider,
} from "../../context";

/**
 * Providers spécifiques aux fonctionnalités du personnel médical et administratif
 * Contient les contextes nécessaires pour les médecins et administrateurs
 */
const StaffProviders = ({ children }) => {
  return (
    <DoctorProvider>
      <DocumentProvider>
        <AppointmentProvider>{children}</AppointmentProvider>
      </DocumentProvider>
    </DoctorProvider>
  );
};

export default StaffProviders;
