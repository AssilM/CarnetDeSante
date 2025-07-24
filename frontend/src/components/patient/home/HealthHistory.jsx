import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointmentContext } from "../../../context";
import { FaCalendarAlt, FaUserMd, FaMapMarkerAlt } from "react-icons/fa";

const HistoryItem = ({ appointment, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "planifié":
        return "bg-blue-100 text-blue-800";
      case "terminé":
        return "bg-green-100 text-green-800";
      case "annulé":
        return "bg-red-100 text-red-800";
      case "en_cours":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "planifié":
        return "Planifié";
      case "terminé":
        return "Terminé";
      case "annulé":
        return "Annulé";
      case "en_cours":
        return "En cours";
      default:
        return status || "Inconnu";
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        <FaCalendarAlt className="text-blue-600" />
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{appointment.title}</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <FaUserMd className="text-gray-400" />
          <span>{appointment.doctor.name}</span>
        </div>
        {appointment.location && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaMapMarkerAlt className="text-gray-400" />
            <span>{appointment.location}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{appointment.date}</span>
      </div>
    </div>
  );
};

const HealthHistory = () => {
  const navigate = useNavigate();
  const { getPastAppointments, getUpcomingAppointments, selectAppointment } = useAppointmentContext();
  const [recentAppointments, setRecentAppointments] = useState([]);

  // Récupérer les rendez-vous récents (passés et à venir)
  useEffect(() => {
    const pastAppointments = getPastAppointments();
    const upcomingAppointments = getUpcomingAppointments();
    
    // Combiner et trier par date (les plus récents en premier)
    const allAppointments = [...pastAppointments, ...upcomingAppointments]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3); // Prendre seulement les 3 plus récents
    
    setRecentAppointments(allAppointments);
  }, [getPastAppointments, getUpcomingAppointments]);

  const handleItemClick = (appointment) => {
    selectAppointment(appointment);
    navigate("/appointments/details");
  };

  const handleViewAll = () => {
    navigate("/appointments");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Historique des rendez-vous</h2>
      </div>
      <div className="space-y-3">
        {recentAppointments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucun rendez-vous récent
          </div>
        ) : (
          recentAppointments.map((appointment) => (
            <HistoryItem
              key={appointment.id}
              appointment={appointment}
              onClick={() => handleItemClick(appointment)}
            />
          ))
        )}
      </div>
      <button
        onClick={handleViewAll}
        className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-800"
      >
        Voir tous mes rendez-vous
      </button>
    </div>
  );
};

export default HealthHistory;
