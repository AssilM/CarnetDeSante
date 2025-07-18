import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/api";
import {
  AppointmentStatusChart,
  UserDistributionChart,
  DocumentTypeChart,
  StatisticsHeader,
} from "../../components/admin/statistics";
import PageWrapper from "../../components/PageWrapper";

const Statistics = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ne charger les stats que si l'utilisateur est admin
    if (currentUser && currentUser.role === "admin") {
      loadStatistics();
    }
  }, [currentUser]);

  const loadStatistics = async () => {
    // Vérifier que l'utilisateur est admin
    if (!currentUser || currentUser.role !== "admin") {
      setError("Accès non autorisé - Rôle administrateur requis");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
      setError("Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
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

  if (loading) {
    return (
      <PageWrapper className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-80 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
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
                  onClick={loadStatistics}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <StatisticsHeader
          title="Statistiques détaillées"
          description="Analysez les données de votre plateforme de santé avec des graphiques interactifs"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en secteurs - Rendez-vous par statut */}
          <AppointmentStatusChart data={stats?.rendezVousParStatut} />

          {/* Graphique en barres - Distribution des utilisateurs */}
          <UserDistributionChart stats={stats} />

          {/* Graphique en aires - Statistiques des documents */}
          <DocumentTypeChart stats={stats} />

          {/* Section d'informations supplémentaires */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé des données
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800 font-medium">
                  Total Patients
                </span>
                <span className="text-blue-600 font-bold">
                  {stats?.patients || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800 font-medium">
                  Total Médecins
                </span>
                <span className="text-green-600 font-bold">
                  {stats?.medecins || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-800 font-medium">
                  Total Rendez-vous
                </span>
                <span className="text-purple-600 font-bold">
                  {stats?.rendezVous || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-800 font-medium">
                  Total Documents
                </span>
                <span className="text-orange-600 font-bold">
                  {stats?.documents || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Statistics;
