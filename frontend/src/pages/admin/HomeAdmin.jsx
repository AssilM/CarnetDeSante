import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import {
  DashboardStats,
  TabButton,
  RecentAppointment,
  UsersOverview,
} from "../../components/admin/home";
import PageWrapper from "../../components/PageWrapper";

const HomeAdmin = () => {
  const { currentUser } = useAuth();
  const { stats, loading, error, activeTab, setActiveTab, loadDashboardStats } =
    useAdmin();

  // État pour gérer l'affichage des rendez-vous
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  // Vérifier que l'utilisateur est admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <PageWrapper className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Accès interdit
                </h3>
                <p className="text-red-700 mt-1">
                  Vous devez être administrateur pour accéder à cette page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Icônes pour les onglets
  const DashboardIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );

  const UsersTabIcon = () => (
    <svg
      className="w-5 h-5"
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

  const DocumentsTabIcon = () => (
    <svg
      className="w-5 h-5"
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

  const AppointmentsTabIcon = () => (
    <svg
      className="w-5 h-5"
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

  const AdminsTabIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  return (
    <PageWrapper className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header classique */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Console d'Administration
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {currentUser?.prenom} {currentUser?.nom}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Gérez votre plateforme de santé
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets classique */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="dashboard"
              title="Tableau de bord"
              active={activeTab === "dashboard"}
              onClick={setActiveTab}
              icon={<DashboardIcon />}
            />
            <TabButton
              id="users"
              title="Gestion utilisateurs"
              active={activeTab === "users"}
              onClick={setActiveTab}
              icon={<UsersTabIcon />}
            />
            <TabButton
              id="appointments"
              title="Rendez-vous"
              active={activeTab === "appointments"}
              onClick={setActiveTab}
              icon={<AppointmentsTabIcon />}
            />
            <TabButton
              id="documents"
              title="Documents"
              active={activeTab === "documents"}
              onClick={setActiveTab}
              icon={<DocumentsTabIcon />}
            />
            <TabButton
              id="admins"
              title="Administrateurs"
              active={activeTab === "admins"}
              onClick={setActiveTab}
              icon={<AdminsTabIcon />}
            />
          </div>
        </div>

        {/* Contenu principal */}
        {activeTab === "dashboard" && (
          <DashboardStats
            stats={stats}
            loading={loading}
            error={error}
            onRetry={loadDashboardStats}
          />
        )}

        {/* Section Rendez-vous */}
        {activeTab === "appointments" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Rendez-vous récents
                {stats?.rendezVousRecents &&
                  stats.rendezVousRecents.length > 5 &&
                  !showAllAppointments && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (5 sur {stats.rendezVousRecents.length})
                    </span>
                  )}
              </h3>
              {stats?.rendezVousRecents &&
                stats.rendezVousRecents.length > 5 && (
                  <button
                    onClick={() => setShowAllAppointments(!showAllAppointments)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showAllAppointments ? "Voir moins" : "Voir tout"}
                  </button>
                )}
            </div>
            <div className="space-y-3">
              {stats?.rendezVousRecents &&
              stats.rendezVousRecents.length > 0 ? (
                (showAllAppointments
                  ? stats.rendezVousRecents
                  : stats.rendezVousRecents.slice(0, 5)
                ).map((appointment, index) => (
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
        )}

        {/* Autres onglets */}
        {activeTab === "users" && <UsersOverview />}

        {activeTab === "documents" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestion des documents
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Interface de gestion des documents en cours de développement...
              </p>
            </div>
          </div>
        )}

        {activeTab === "admins" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestion des administrateurs
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Interface de gestion des administrateurs en cours de
                développement...
              </p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default HomeAdmin;
