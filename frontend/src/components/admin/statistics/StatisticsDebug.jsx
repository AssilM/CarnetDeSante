import React from "react";

const StatisticsDebug = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Debug - Données brutes
      </h3>
      <pre className="text-xs bg-white p-4 rounded border overflow-auto">
        {JSON.stringify(stats, null, 2)}
      </pre>
    </div>
  );
};

export default StatisticsDebug;
