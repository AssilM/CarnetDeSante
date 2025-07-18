import React, { useState } from "react";
import StatCard from "./StatCard";
import RecentAppointment from "./RecentAppointment";

// Icônes pour les statistiques
const UsersIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const DoctorsIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const AppointmentsIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const DocumentsIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const DashboardStats = ({ stats, loading, error, onRetry }) => {
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  const handleToggleAppointments = () => {
    setShowAllAppointments(!showAllAppointments);
  };

  // Limiter l'affichage à 5 rendez-vous par défaut
  const displayedAppointments = stats?.rendezVousRecents
    ? showAllAppointments
      ? stats.rendezVousRecents
      : stats.rendezVousRecents.slice(0, 5)
    : [];

  const hasMoreAppointments =
    stats?.rendezVousRecents && stats.rendezVousRecents.length > 5;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patients"
          value={stats.patients}
          icon={<UsersIcon />}
          color="blue"
        />
        <StatCard
          title="Médecins"
          value={stats.medecins}
          icon={<DoctorsIcon />}
          color="green"
        />
        <StatCard
          title="Rendez-vous"
          value={stats.rendezVous}
          icon={<AppointmentsIcon />}
          color="purple"
        />
        <StatCard
          title="Documents"
          value={stats.documents}
          icon={<DocumentsIcon />}
          color="orange"
        />
      </div>

      {/* Section des rendez-vous récents */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Rendez-vous récents
            {hasMoreAppointments && !showAllAppointments && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (5 sur {stats.rendezVousRecents.length})
              </span>
            )}
          </h3>
          {hasMoreAppointments && (
            <button
              onClick={handleToggleAppointments}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showAllAppointments ? "Voir moins" : "Voir tout"}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {displayedAppointments && displayedAppointments.length > 0 ? (
            displayedAppointments.map((appointment, index) => (
              <RecentAppointment key={index} appointment={appointment} />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">Aucun rendez-vous récent</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques par statut */}
      {stats.rendezVousParStatut &&
        Object.keys(stats.rendezVousParStatut).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rendez-vous par statut
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.rendezVousParStatut).map(
                ([statut, count]) => (
                  <div
                    key={statut}
                    className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {count}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{statut}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default DashboardStats;
