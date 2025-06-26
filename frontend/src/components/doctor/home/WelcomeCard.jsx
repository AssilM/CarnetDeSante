import React from "react";
import { useAuth } from "../../../context/AuthContext";

const WelcomeCard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-blue-700 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Bienvenue Dr. {currentUser?.nom} {currentUser?.prenom}
          </h2>
          <p className="mt-2 text-blue-100">
            Vous avez 8 rendez-vous aujourd'hui et 3 nouveaux messages
          </p>
        </div>
        <div className="bg-white p-4 rounded-full">
          <svg
            className="w-12 h-12 text-blue-700"
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
        </div>
      </div>
      <div className="mt-6 flex space-x-4">
        <button className="bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition font-medium flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          Agenda du jour
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition font-medium flex items-center border border-blue-300">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          Rechercher un patient
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;
