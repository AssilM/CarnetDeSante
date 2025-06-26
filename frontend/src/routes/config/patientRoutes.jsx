import React from "react";

// Pages patient
import HomePatient from "../../pages/patient/HomePatient";
import MedicalProfile from "../../pages/patient/MedicalProfile";
import Documents from "../../pages/patient/documents/Documents";
import DocumentDetails from "../../pages/patient/documents/DocumentDetails";
import Vaccination from "../../pages/patient/vaccination/Vaccination";
import VaccineDetails from "../../pages/patient/vaccination/VaccineDetails";

// Pages du profil médical
import EditMedicalInfo from "../../pages/patient/medical/EditMedicalInfo";
import MedicalHistoryList from "../../pages/patient/medical/MedicalHistoryList";
import MedicalHistoryDetails from "../../pages/patient/medical/MedicalHistoryDetails";
import AddMedicalHistory from "../../pages/patient/medical/AddMedicalHistory";
import AllergyList from "../../pages/patient/medical/AllergyList";
import AllergyDetails from "../../pages/patient/medical/AllergyDetails";
import AddAllergy from "../../pages/patient/medical/AddAllergy";
import HealthEventList from "../../pages/patient/medical/HealthEventList";
import HealthEventDetails from "../../pages/patient/medical/HealthEventDetails";

// Pages de paramètres
import Settings from "../../pages/patient/settings/Settings";
import EditEmail from "../../pages/patient/settings/EditEmail";
import EditPhone from "../../pages/patient/settings/EditPhone";
import EditPassword from "../../pages/patient/settings/EditPassword";
import EditAddress from "../../pages/patient/settings/EditAddress";

// Pages de rendez-vous
import Appointments from "../../pages/patient/appointments/Appointments";
import AppointmentDetails from "../../pages/patient/appointments/AppointmentDetails";
import BookAppointment from "../../pages/patient/appointments/BookAppointment";
import DoctorSelection from "../../pages/patient/appointments/DoctorSelection";
import SlotSelection from "../../pages/patient/appointments/SlotSelection";
import AppointmentConfirmation from "../../pages/patient/appointments/AppointmentConfirmation";

// Configuration des routes patient
const patientRoutes = [
  // Routes principales
  {
    path: "/patient/home",
    element: <HomePatient />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/home",
    element: <HomePatient />,
    layout: "main",
    protected: true,
  },
  {
    path: "/medical-profile",
    element: <MedicalProfile />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/documents",
    element: <Documents />,
    layout: "main",
    protected: true,
  },
  {
    path: "/documents/details",
    element: <DocumentDetails />,
    layout: "main",
    protected: true,
  },
  {
    path: "/vaccination",
    element: <Vaccination />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/vaccination/details",
    element: <VaccineDetails />,
    layout: "main",
    protected: true,
    role: "patient",
  },

  // Routes profil médical
  {
    path: "/medical-profile/edit",
    element: <EditMedicalInfo />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/medical-profile/history",
    element: <MedicalHistoryList />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/medical-profile/history/add",
    element: <AddMedicalHistory />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/medical-profile/history/details",
    element: <MedicalHistoryDetails />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/medical-profile/allergies",
    element: <AllergyList />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/medical-profile/allergies/add",
    element: <AddAllergy />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/medical-profile/allergies/details",
    element: <AllergyDetails />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/medical-profile/details",
    element: <HealthEventDetails />,
    layout: "main",
    protected: true,
    role: "patient",
  },

  // Routes paramètres
  {
    path: "/settings",
    element: <Settings />,
    layout: "main",
    protected: true,
  },
  {
    path: "/settings/edit-email",
    element: <EditEmail />,
    layout: "main",
    protected: true,
  },
  {
    path: "/settings/edit-phone",
    element: <EditPhone />,
    layout: "main",
    protected: true,
  },
  {
    path: "/settings/edit-password",
    element: <EditPassword />,
    layout: "main",
    protected: true,
  },
  {
    path: "/settings/edit-address",
    element: <EditAddress />,
    layout: "main",
    protected: true,
  },

  // Routes rendez-vous
  {
    path: "/appointments",
    element: <Appointments />,
    layout: "main",
    protected: true,
  },
  {
    path: "/appointments/details",
    element: <AppointmentDetails />,
    layout: "main",
    protected: true,
  },
  // Routes de prise de rendez-vous (complètement séparées)
  {
    path: "/book-appointment",
    element: <BookAppointment />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/book-appointment/doctor",
    element: <DoctorSelection />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/book-appointment/slot",
    element: <SlotSelection />,
    layout: "main",
    protected: true,
    role: "patient",
  },
  {
    path: "/book-appointment/confirmation",
    element: <AppointmentConfirmation />,
    layout: "main",
    protected: true,
    role: "patient",
  },
];

export default patientRoutes;
