import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";

const CloseProfile = () => {
  const [requestDeletion, setRequestDeletion] = useState(false);
  const { fullName } = useUserContext();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Clôture du profil de {fullName}
      </h2>

      <div className="bg-secondary border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-3">
        <FiInfo className="text-primary text-xl mt-1" />
        <div>
          <p className="font-medium text-primary/90">
            Avant de clôturer, pensez à récupérer vos données dans la rubrique
            Télécharger les données.
          </p>
          <p className="text-primary/80">
            Une fois le profil clôturé, il ne sera plus possible de les
            télécharger.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6">
        <p className="text-gray-600 mb-4">
          En clôturant, je renonce à l'utilisation du profil Mon espace santé et
          je perds l'accès aux informations qu'il contient. Les professionnels
          de santé ne pourront plus y accéder.
        </p>

        <p className="text-gray-600 mb-4">
          Je peux faire une demande de suppression de ces informations. Celle-ci
          sera traitée ultérieurement.
        </p>

        <p className="text-gray-600 mb-6">
          Sans demande de suppression, ces informations seront conservées
          pendant 10 ans dans un environnement sécurisé et homologué par
          l'Agence Nationale de Sécurité des Systèmes d'Information.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={requestDeletion}
              onChange={(e) => setRequestDeletion(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">
              Je souhaite que mes données soient supprimées
            </span>
          </label>

          <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors">
            Clôturer mon profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseProfile;
