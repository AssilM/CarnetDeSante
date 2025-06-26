import React from "react";
import { Route } from "react-router-dom";

// Pages d'authentification
import LandingPage from "../pages/auth/LandingPage";
import RoleSelectPage from "../pages/auth/RoleSelectPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SessionExpired from "../pages/SessionExpired";

/**
 * Routes pour l'authentification
 * Exporte un tableau de routes d'authentification
 */
const AuthRoutes = [
  <Route key="landing" path="/" element={<LandingPage />} />,
  <Route
    key="role-select"
    path="/auth/role-select"
    element={<RoleSelectPage />}
  />,
  <Route key="login" path="/auth/login" element={<LoginPage />} />,
  <Route key="register" path="/auth/register" element={<RegisterPage />} />,
  <Route
    key="session-expired"
    path="/session-expired"
    element={<SessionExpired />}
  />,
];

export default AuthRoutes;
