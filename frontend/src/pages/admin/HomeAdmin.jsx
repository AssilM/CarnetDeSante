import React from "react";
import { useAuth } from "../../context/AuthContext";
import PageWrapper from "../../components/PageWrapper";

const HomeAdmin = () => {
  const { currentUser } = useAuth();

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Console d'Administration
          </h1>
          <div className="p-4 bg-gray-800 text-white rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Bienvenue {currentUser?.prenom} {currentUser?.nom}
                </h2>
                <p className="mt-1 text-gray-300">
                  Vous êtes connecté en tant qu'administrateur
                </p>
              </div>
              <div className="bg-white p-3 rounded-full">
                <svg
                  className="w-10 h-10 text-gray-800"
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
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <svg
                className="w-10 h-10 text-gray-700 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">
                Gestion des utilisateurs
              </h3>
              <p className="text-gray-600 mb-4">
                Gérez les comptes patients, médecins et administrateurs
              </p>
              <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                Accéder
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <svg
                className="w-10 h-10 text-gray-700 mx-auto mb-2"
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
              <h3 className="text-lg font-semibold text-gray-800">
                Rapports et statistiques
              </h3>
              <p className="text-gray-600 mb-4">
                Consultez les statistiques d'utilisation et les rapports
              </p>
              <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                Accéder
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <svg
                className="w-10 h-10 text-gray-700 mx-auto mb-2"
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
              <h3 className="text-lg font-semibold text-gray-800">
                Configuration
              </h3>
              <p className="text-gray-600 mb-4">
                Paramètres système et configuration de l'application
              </p>
              <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                Accéder
              </button>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Activité récente
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="font-medium">Nouvel utilisateur inscrit</p>
                <p className="text-sm text-gray-600">
                  Marie Durand - Patient - il y a 2 heures
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="font-medium">Mise à jour du système</p>
                <p className="text-sm text-gray-600">
                  Version 2.1.3 déployée - il y a 1 jour
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="font-medium">Nouveau médecin validé</p>
                <p className="text-sm text-gray-600">
                  Dr. Thomas Bernard - Cardiologue - il y a 2 jours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HomeAdmin;
