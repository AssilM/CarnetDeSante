import React from "react";
import InfoCard from "./InfoCard";

const InfoCardSection = () => {
  const cards = [
    {
      title: "Alertes",
      icon: "⚠️",
      message: "2 actions urgentes à effectuer",
      messageColor: "text-red-600",
    },
    {
      title: "Rendez-vous",
      icon: "📅",
      message: "Aucun rendez-vous à venir",
    },
    {
      title: "Messagerie",
      icon: "✉️",
      message: "3 nouveaux messages",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {cards.map((card, index) => (
        <div key={index} className="flex-1">
          <InfoCard {...card} />
        </div>
      ))}
    </div>
  );
};

export default InfoCardSection;
