import React from "react";

const BMIChart = ({ bmiValue, height, weight }) => {
  // Fonction pour déterminer la catégorie IMC
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: "Insuffisance pondérale", color: "#3B82F6", severity: "low" };
    if (bmi < 25) return { category: "Poids normal", color: "#10B981", severity: "normal" };
    if (bmi < 30) return { category: "Surpoids", color: "#F59E0B", severity: "warning" };
    if (bmi < 35) return { category: "Obésité modérée", color: "#EF4444", severity: "high" };
    return { category: "Obésité sévère", color: "#DC2626", severity: "critical" };
  };



  // Calculer l'IMC si les données sont disponibles
  const calculateBMI = () => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const currentBMI = bmiValue || calculateBMI();
  const bmiCategory = currentBMI ? getBMICategory(currentBMI) : null;



  if (!currentBMI) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Indice de Masse Corporelle (IMC)
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">
            Veuillez renseigner votre taille et poids pour voir votre IMC
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Indice de Masse Corporelle (IMC)
      </h3>
      
      {/* Affichage de l'IMC actuel et de la catégorie */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Votre IMC</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentBMI.toFixed(1)} kg/m²
            </p>
          </div>
          <div className="text-right">
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${bmiCategory.color}20`, 
                color: bmiCategory.color 
              }}
            >
              {bmiCategory.category}
            </span>
          </div>
        </div>
        
        {/* Barre de progression IMC */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(Math.max((currentBMI - 15) / 20 * 100, 0), 100)}%`,
              backgroundColor: bmiCategory.color 
            }}
          ></div>
        </div>
        
        {/* Échelle IMC */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>35</span>
        </div>
      </div>



      {/* Informations sur les catégories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="text-center p-2 rounded bg-blue-50">
          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
          <p className="font-medium">Insuffisance</p>
          <p className="text-gray-500">&lt; 18.5</p>
        </div>
        <div className="text-center p-2 rounded bg-green-50">
          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
          <p className="font-medium">Normal</p>
          <p className="text-gray-500">18.5 - 24.9</p>
        </div>
        <div className="text-center p-2 rounded bg-yellow-50">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
          <p className="font-medium">Surpoids</p>
          <p className="text-gray-500">25 - 29.9</p>
        </div>
        <div className="text-center p-2 rounded bg-red-50">
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
          <p className="font-medium">Obésité</p>
          <p className="text-gray-500">≥ 30</p>
        </div>
      </div>
    </div>
  );
};

export default BMIChart; 