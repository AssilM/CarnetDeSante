import React from "react";

// Pages pour le personnel médical et administratif
import HomeDoctor from "../../pages/doctor/HomeDoctor";
import HomeAdmin from "../../pages/admin/HomeAdmin";

// Configuration des routes pour le personnel
const staffRoutes = [
  // Routes médecin
  {
    path: "/doctor/home",
    element: <HomeDoctor />,
    layout: "main",
    protected: true,
    role: "medecin",
  },

  // Routes admin
  {
    path: "/admin/home",
    element: <HomeAdmin />,
    layout: "main",
    protected: true,
    role: "admin",
  },

  // Autres routes pour médecin et admin peuvent être ajoutées ici
];

export default staffRoutes;
