import React, { createContext, useContext, useState } from "react";

// Créer un contexte pour les médecins
const DoctorContext = createContext(null);

export const DoctorProvider = ({ children }) => {
  // État pour stocker la liste des médecins
  const [doctors, setDoctors] = useState([
    {
      id: "doc-1",
      name: "Dr. Martin Dupont",
      specialty: "Médecin généraliste",
      address: "15 rue de la Santé, 75001 Paris",
      phone: "01 23 45 67 89",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      rating: 4.8,
      availableSlots: [
        {
          date: "2024-05-20",
          slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
        },
        { date: "2024-05-21", slots: ["09:00", "10:00", "14:00", "16:00"] },
        { date: "2024-05-22", slots: ["11:00", "14:00", "15:00", "16:00"] },
      ],
    },
    {
      id: "doc-2",
      name: "Dr. Sophie Laurent",
      specialty: "Dermatologue",
      address: "22 avenue Montaigne, 75008 Paris",
      phone: "01 34 56 78 90",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      rating: 4.9,
      availableSlots: [
        { date: "2024-05-20", slots: ["14:00", "15:00", "16:00"] },
        { date: "2024-05-21", slots: ["09:00", "10:00", "11:00"] },
        { date: "2024-05-22", slots: ["14:00", "15:00", "16:00", "17:00"] },
      ],
    },
    {
      id: "doc-3",
      name: "Dr. Thomas Bernard",
      specialty: "Cardiologue",
      address: "8 boulevard Haussmann, 75009 Paris",
      phone: "01 45 67 89 01",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.7,
      availableSlots: [
        { date: "2024-05-20", slots: ["08:00", "09:00", "16:00", "17:00"] },
        { date: "2024-05-21", slots: ["08:00", "09:00", "10:00", "11:00"] },
        { date: "2024-05-23", slots: ["14:00", "15:00", "16:00"] },
      ],
    },
    {
      id: "doc-4",
      name: "Dr. Emma Petit",
      specialty: "Pédiatre",
      address: "5 rue des Enfants, 75015 Paris",
      phone: "01 56 78 90 12",
      image: "https://randomuser.me/api/portraits/women/31.jpg",
      rating: 4.9,
      availableSlots: [
        { date: "2024-05-20", slots: ["09:00", "10:00", "11:00", "14:00"] },
        { date: "2024-05-22", slots: ["09:00", "10:00", "11:00"] },
        { date: "2024-05-23", slots: ["14:00", "15:00", "16:00"] },
      ],
    },
    {
      id: "doc-5",
      name: "Dr. Jean Moreau",
      specialty: "Ophtalmologue",
      address: "18 rue de la Vision, 75006 Paris",
      phone: "01 67 89 01 23",
      image: "https://randomuser.me/api/portraits/men/64.jpg",
      rating: 4.6,
      availableSlots: [
        { date: "2024-05-21", slots: ["14:00", "15:00", "16:00", "17:00"] },
        { date: "2024-05-22", slots: ["14:00", "15:00", "16:00"] },
        { date: "2024-05-24", slots: ["09:00", "10:00", "11:00"] },
      ],
    },
    {
      id: "doc-6",
      name: "Dr. Marie Lefebvre",
      specialty: "Gynécologue",
      address: "27 avenue des Femmes, 75011 Paris",
      phone: "01 78 90 12 34",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.8,
      availableSlots: [
        { date: "2024-05-20", slots: ["09:00", "10:00", "11:00"] },
        { date: "2024-05-21", slots: ["14:00", "15:00", "16:00"] },
        { date: "2024-05-25", slots: ["09:00", "10:00", "11:00", "14:00"] },
      ],
    },
  ]);

  // État pour stocker les spécialités disponibles
  const [specialties] = useState([
    "Médecin généraliste",
    "Dermatologue",
    "Cardiologue",
    "Pédiatre",
    "Ophtalmologue",
    "Gynécologue",
    "Dentiste",
    "ORL",
    "Rhumatologue",
    "Psychiatre",
  ]);

  // État pour le médecin actuellement sélectionné
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // État pour la date et le créneau sélectionnés
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Fonctions pour filtrer les médecins
  const getDoctorsBySpecialty = (specialty) => {
    return doctors.filter((doctor) => doctor.specialty === specialty);
  };

  const searchDoctors = (query) => {
    if (!query) return doctors;

    const searchTerm = query.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm) ||
        doctor.specialty.toLowerCase().includes(searchTerm)
    );
  };

  // Fonction pour obtenir les créneaux disponibles d'un médecin à une date donnée
  const getAvailableSlots = (doctorId, date) => {
    const doctor = doctors.find((doc) => doc.id === doctorId);
    if (!doctor) return [];

    const daySlots = doctor.availableSlots.find((slot) => slot.date === date);
    return daySlots ? daySlots.slots : [];
  };

  // Fonction pour réserver un créneau
  const bookAppointment = (appointment) => {
    // Mettre à jour les créneaux disponibles
    const doctor = doctors.find((doc) => doc.id === appointment.doctorId);
    if (!doctor) return false;

    // Trouver le jour correspondant
    const dayIndex = doctor.availableSlots.findIndex(
      (day) => day.date === appointment.date
    );
    if (dayIndex === -1) return false;

    // Supprimer le créneau réservé
    const updatedSlots = [...doctor.availableSlots];
    updatedSlots[dayIndex] = {
      ...updatedSlots[dayIndex],
      slots: updatedSlots[dayIndex].slots.filter(
        (slot) => slot !== appointment.time
      ),
    };

    // Mettre à jour le médecin
    const updatedDoctor = { ...doctor, availableSlots: updatedSlots };
    const updatedDoctors = doctors.map((doc) =>
      doc.id === updatedDoctor.id ? updatedDoctor : doc
    );

    setDoctors(updatedDoctors);
    return true;
  };

  // Valeurs exposées par le contexte
  const value = {
    doctors,
    specialties,
    selectedDoctor,
    setSelectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    getDoctorsBySpecialty,
    searchDoctors,
    getAvailableSlots,
    bookAppointment,
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useDoctorContext = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error(
      "useDoctorContext doit être utilisé avec un DoctorProvider"
    );
  }
  return context;
};
