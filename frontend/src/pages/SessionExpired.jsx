import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-C.svg";
import Footer from "../components/Footer";

const SessionExpired = () => {
  // Fonction pour gérer la reconnexion
  const handleReconnect = () => {
    // Redirection forcée vers la page de connexion
    window.location.replace("/auth/login");
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <span className="ml-2 text-xl font-medium text-blue-800">
              Carnet de <span className="text-blue-500">Santé Virtuel</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session expirée
            </h2>
            <p className="text-gray-600 mb-6">
              Votre session a expiré pour des raisons de sécurité. Veuillez vous
              reconnecter pour continuer.
            </p>
            <button
              onClick={handleReconnect}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SessionExpired;
