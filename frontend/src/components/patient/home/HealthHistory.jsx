import React from "react";

const HistoryItem = ({ icon, title, name, date }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <div className="flex-grow">
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-600">{name}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">{date}</span>
    </div>
  </div>
);

const HealthHistory = () => {
  const historyItems = [
    {
      icon: "💊",
      title: "Délivrance de médicament",
      name: "Jean Dupont",
      date: "01/01/2025",
    },
    {
      icon: "🌿",
      title: "Ordonnance pour allergie",
      name: "Jean Dupont",
      date: "01/01/2025",
    },
    {
      icon: "💉",
      title: "Vaccination fièvre jaune",
      name: "Jean Dupont",
      date: "01/01/2025",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Historique santé</h2>
      </div>
      <div className="space-y-3">
        {historyItems.map((item, index) => (
          <HistoryItem key={index} {...item} />
        ))}
      </div>
      <button className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-800">
        Cliquez ici pour retrouver votre historique complet
      </button>
    </div>
  );
};

export default HealthHistory;
