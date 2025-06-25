import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-C.svg";
import Footer from "../../components/Footer";

const RoleCard = ({ title, description, icon, to }) => {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300 border border-gray-100"
    >
      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-blue-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </Link>
  );
};

const RoleSelectPage = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <span className="ml-2 text-xl font-medium text-blue-800">
              Carnet de <span className="text-blue-500">Santé Virtuel</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-4">
            Se connecter ou s'inscrire
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Veuillez sélectionner votre profil pour continuer
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <RoleCard
              title="Patient"
              description="Accédez à votre carnet de santé, gérez vos rendez-vous et partagez vos documents médicaux."
              icon={
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              }
              to="/auth/login?role=patient"
            />

            <RoleCard
              title="Médecin"
              description="Accédez aux dossiers de vos patients et gérez vos rendez-vous en toute simplicité."
              icon={
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              }
              to="/auth/login?role=medecin"
            />

            <RoleCard
              title="Administrateur"
              description="Gérez les utilisateurs et les paramètres de la plateforme."
              icon={
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              }
              to="/auth/login?role=admin"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoleSelectPage;
