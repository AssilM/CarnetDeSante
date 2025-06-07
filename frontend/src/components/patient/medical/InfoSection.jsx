import React from "react";

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm text-gray-500">{label}</label>
    <div className="mt-1 py-1 px-3 bg-gray-100 rounded text-gray-900">
      {value}
    </div>
  </div>
);

const InfoSection = ({ patientInfo, onModify }) => {
  return (
    <section className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Informations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <InfoField label="Nom" value={patientInfo.lastName} />
          <InfoField label="Prénom" value={patientInfo.firstName} />
          <InfoField label="Âge" value={`${patientInfo.age} ans`} />
          <InfoField label="Sexe" value={patientInfo.gender} />
          <InfoField label="Groupe Sanguin" value={patientInfo.bloodType} />
          <InfoField label="Taille" value={`${patientInfo.height} cm`} />
          <InfoField label="Poids" value={`${patientInfo.weight} kg`} />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onModify}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
