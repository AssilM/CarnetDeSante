import React from "react";

// Pages d'authentification
import LandingPage from "../../pages/auth/LandingPage";
import RoleSelectPage from "../../pages/auth/RoleSelectPage";
import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";

// Configuration des routes d'authentification
const authRoutes = [
  {
    path: "/",
    element: <LandingPage />,
    layout: "auth",
  },
  {
    path: "/auth/role-select",
    element: <RoleSelectPage />,
    layout: "auth",
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
    layout: "auth",
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
    layout: "auth",
  },
];

export default authRoutes;
