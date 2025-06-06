import React from "react";
import { FiShield, FiChevronRight } from "react-icons/fi";
import { useUserContext } from "../../../context/UserContext";

const ConfidentialityCard = ({ title, description, onClick }) => (
  <div
    className="bg-white rounded-lg p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <div className="flex-grow">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
    <FiChevronRight className="text-xl text-gray-400" />
  </div>
);

const Confidentiality = () => {
  const { email } = useUserContext();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Confidentialité</h2>
      <p className="text-gray-600 mb-6">
        Les données contenues dans Mon espace santé sont confidentielles. Les
        professionnels de santé ne peuvent avoir accès qu'à la rubrique
        Documents ainsi qu'aux rubriques Vaccinations, Mon histoire de santé et
        Entourage et volontés du Profil médical.
      </p>
      <p className="text-gray-600 mb-6">
        Je peux choisir de leur donner accès ou non à ces informations.
      </p>
      <p className="text-gray-600 mb-6">
        À chaque accès, je recevrai une notification sur l'adresse e-mail{" "}
        {email}.
      </p>

      <div className="space-y-4">
        <ConfidentialityCard
          title="Gestion des accès"
          description="Gérez les accès des professionnels de santé à vos données"
          onClick={() => {}}
        />
        <ConfidentialityCard
          title="Notifications"
          description="Paramétrez les notifications d'accès à vos données"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export default Confidentiality;
