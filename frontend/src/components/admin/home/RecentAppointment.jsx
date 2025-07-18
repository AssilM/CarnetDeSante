import React from "react";

const RecentAppointment = ({ appointment }) => {
  const getStatusColor = (statut) => {
    switch (statut) {
      case "confirmé":
        return "bg-green-100 text-green-800";
      case "planifié":
        return "bg-blue-100 text-blue-800";
      case "annulé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {appointment.patient_prenom?.charAt(0)}
              {appointment.patient_nom?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {appointment.patient_prenom} {appointment.patient_nom}
            </p>
            <p className="text-sm text-gray-600">
              Dr. {appointment.medecin_prenom} {appointment.medecin_nom}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(appointment.date).toLocaleDateString("fr-FR")} à{" "}
              {appointment.heure}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
            appointment.statut
          )}`}
        >
          {appointment.statut}
        </span>
      </div>
    </div>
  );
};

export default RecentAppointment;
