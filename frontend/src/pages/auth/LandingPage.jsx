import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-C.svg";
import Footer from "../../components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <span className="ml-2 text-xl font-medium text-blue-800">
              Carnet de <span className="text-blue-500">Santé Virtuel</span>
            </span>
          </div>
          <Link
            to="/auth/role-select"
            className="bg-white text-blue-600 border border-blue-600 px-5 py-2 rounded-full hover:bg-blue-50 transition duration-300"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Bienvenue sur "Carnet de santé virtuel"
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Votre santé et celle de votre famille entre vos mains.
          </p>
          <p className="text-gray-600 mb-8">
            Centralisez, gérez et partagez facilement vos informations médicales
            et celles de vos proches grâce à notre "carnet de santé numérique"
            sécurisé.
          </p>
          <Link
            to="/auth/role-select"
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Commencer maintenant
          </Link>
        </div>
        <div className="md:w-1/2">
          {/* Espace réservé pour l'image héro */}
          <div className="w-full h-64 md:h-96 bg-blue-100 rounded-lg shadow-xl flex items-center justify-center">
            <p className="text-blue-400 font-medium">Image à venir</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row mb-16 items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              {/* Espace réservé pour l'image de documents */}
              <div className="w-full h-64 bg-blue-50 rounded-lg shadow-lg flex items-center justify-center">
                <p className="text-blue-400 font-medium">Documents médicaux</p>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Gérez et partagez vos documents médicaux en toute simplicité
              </h2>
              <p className="text-gray-600 mb-4">
                Avec le Carnet de Santé Virtuel, accédez facilement à tous vos
                documents médicaux en un seul endroit.
              </p>
              <p className="text-gray-600 mb-4">
                Consultez votre historique de consultations, vos ordonnances et
                vos examens à tout moment.
              </p>
              <p className="text-gray-600">
                Vous pouvez également ajouter ou modifier vos informations de
                santé en toute simplicité, et partager vos dossiers médicaux
                avec les professionnels de santé de votre choix, de manière
                sécurisée et contrôlée.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              {/* Espace réservé pour l'image de communication */}
              <div className="w-full h-64 bg-blue-50 rounded-lg shadow-lg flex items-center justify-center">
                <p className="text-blue-400 font-medium">
                  Communication avec médecins
                </p>
              </div>
            </div>
            <div className="md:w-1/2 md:pr-10">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Communiquez facilement avec vos médecins
              </h2>
              <p className="text-gray-600 mb-4">
                Grâce à la messagerie intégrée du Carnet de Santé Virtuel,
                restez en contact direct avec vos médecins.
              </p>
              <p className="text-gray-600 mb-4">
                Posez vos questions, recevez des conseils, partagez rapidement
                vos documents médicaux ou vos préoccupations de santé.
              </p>
              <p className="text-gray-600">
                Une communication simple, rapide et sécurisée pour un meilleur
                suivi de votre santé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prenez le contrôle de votre santé dès aujourd'hui
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui gèrent déjà efficacement
            leur santé avec notre solution.
          </p>
          <Link
            to="/auth/role-select"
            className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition duration-300 shadow-md"
          >
            Créer mon carnet de santé
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
