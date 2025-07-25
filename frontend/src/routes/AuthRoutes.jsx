import React from "react";
import { Route } from "react-router-dom";

// Composant de protection des routes d'authentification
import { AuthGuard } from "../components/AuthGuard";

// Pages d'authentification
import LandingPage from "../pages/auth/LandingPage";
import RoleSelectPage from "../pages/auth/RoleSelectPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SessionExpired from "../pages/SessionExpired";
import Forbidden from "../pages/Forbidden";

/**
 * Routes pour l'authentification
 * Exporte un tableau de routes d'authentification
 *
 * Les routes protégées par AuthGuard empêchent l'accès aux utilisateurs déjà connectés
 * Les routes d'erreur (/session-expired, /403) restent accessibles
 */
const AuthRoutes = [
  // Route d'accueil - protégée par AuthGuard
  <Route
    key="landing"
    path="/"
    element={
      <AuthGuard>
        <LandingPage />
      </AuthGuard>
    }
  />,

  // Route de sélection de rôle - protégée par AuthGuard
  <Route
    key="role-select"
    path="/auth/role-select"
    element={
      <AuthGuard>
        <RoleSelectPage />
      </AuthGuard>
    }
  />,

  // Route de connexion - protégée par AuthGuard
  <Route
    key="login"
    path="/auth/login"
    element={
      <AuthGuard>
        <LoginPage />
      </AuthGuard>
    }
  />,

  // Route d'inscription - protégée par AuthGuard
  <Route
    key="register"
    path="/auth/register"
    element={
      <AuthGuard>
        <RegisterPage />
      </AuthGuard>
    }
  />,

  // Routes d'erreur - NON protégées (toujours accessibles)
  <Route
    key="session-expired"
    path="/session-expired"
    element={<SessionExpired />}
  />,
  <Route key="forbidden" path="/403" element={<Forbidden />} />,
];

export default AuthRoutes;
