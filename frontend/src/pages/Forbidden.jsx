import React from "react";
import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Accès non autorisé</h2>
      <p className="mb-6 max-w-md">
        Vous n’avez pas la permission de consulter cette page. Si vous pensez
        qu’il s’agit d’une erreur, contactez un administrateur.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
};

export default Forbidden;
