import React from "react";
import { FiChevronRight } from "react-icons/fi";

const ActionCard = ({ title, description, onClick }) => (
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

const HistoryData = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Historique et données</h2>
      <p className="text-gray-600 mb-6">
        J'ai accès à l'historique de mes activités et à celles de mes
        professionnels de santé. Je peux aussi télécharger toutes mes données.
      </p>

      <div className="space-y-4">
        <ActionCard
          title="Historique d'activité"
          description="Consultez l'historique des actions effectuées sur votre profil"
          onClick={() => {}}
        />
        <ActionCard
          title="Télécharger les données"
          description="Téléchargez l'ensemble de vos données personnelles"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export default HistoryData;
