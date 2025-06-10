import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHealthEventContext } from "../../../context";

const HistoryItem = ({ icon, title, name, date, onClick }) => (
  <div
    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
    onClick={onClick}
  >
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
  const navigate = useNavigate();
  const { items, setItems, setSelectedItem } = useHealthEventContext();

  // Initialisation des données de test
  useEffect(() => {
    if (items.length === 0) {
      setItems([
        {
          id: "1",
          title: "Délivrance de médicament",
          doctor: "Dr. Martin",
          hospital: "Pharmacie Centrale",
          date: "01/01/2025",
          description: "Amoxicilline 1000mg, 3x par jour pendant 7 jours",
          pinned: false,
          type: "medication",
          icon: "💊",
        },
        {
          id: "2",
          title: "Ordonnance pour allergie",
          doctor: "Dr. Durand",
          hospital: "Centre Médical",
          date: "15/12/2024",
          description: "Traitement anti-allergique saisonnier",
          pinned: true,
          type: "prescription",
          icon: "🌿",
        },
        {
          id: "3",
          title: "Vaccination fièvre jaune",
          doctor: "Dr. Bernard",
          hospital: "Centre de vaccination",
          date: "10/12/2024",
          description: "Vaccination contre la fièvre jaune avant voyage",
          pinned: false,
          type: "vaccination",
          icon: "💉",
        },
        {
          id: "4",
          title: "Consultation cardiologie",
          doctor: "Dr. Petit",
          hospital: "Hôpital Régional",
          date: "05/12/2024",
          description: "Contrôle annuel, résultats normaux",
          pinned: false,
          type: "consultation",
          icon: "❤️",
        },
        {
          id: "5",
          title: "Analyse sanguine",
          doctor: "Dr. Martin",
          hospital: "Laboratoire Central",
          date: "01/12/2024",
          description: "Bilan sanguin complet, résultats normaux",
          pinned: false,
          type: "analysis",
          icon: "🔬",
        },
      ]);
    }
  }, [setItems, items.length]);

  // Afficher seulement les 3 événements les plus récents
  const recentEvents = items
    .sort((a, b) => {
      // Convertir les dates au format français (DD/MM/YYYY) en objets Date
      const dateA = a.date.split("/").reverse().join("-");
      const dateB = b.date.split("/").reverse().join("-");
      return new Date(dateB) - new Date(dateA);
    })
    .slice(0, 3);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    navigate("/medical-profile/details");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Historique santé</h2>
      </div>
      <div className="space-y-3">
        {recentEvents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucun événement récent
          </div>
        ) : (
          recentEvents.map((item) => (
            <HistoryItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              name={item.doctor}
              date={item.date}
              onClick={() => handleItemClick(item)}
            />
          ))
        )}
      </div>
      <button
        onClick={() => navigate("/medical-profile")}
        className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-800"
      >
        Cliquez ici pour retrouver votre historique complet
      </button>
    </div>
  );
};

export default HealthHistory;
