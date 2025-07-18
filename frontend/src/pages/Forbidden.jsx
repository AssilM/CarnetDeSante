import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Forbidden = () => {
  const { currentUser } = useAuth();

  const getHomePath = () => {
    if (!currentUser) return "/auth/login";

    switch (currentUser.role) {
      case "admin":
        return "/admin/home";
      case "medecin":
        return "/doctor/home";
      case "patient":
        return "/patient/home";
      default:
        return "/auth/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Accès interdit
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>

          <div className="space-y-3">
            <Link
              to={getHomePath()}
              className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </Link>

            <Link
              to="/auth/login"
              className="inline-block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Se connecter avec un autre compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
