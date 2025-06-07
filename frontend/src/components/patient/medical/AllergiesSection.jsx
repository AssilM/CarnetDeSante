import React from "react";

const AllergyItem = ({ type, date, onDetails }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
      <span className="text-orange-600 text-xl">*</span>
    </div>
    <div className="flex-grow">
      <div className="text-sm text-gray-900">{type}</div>
      <div className="text-sm text-gray-500">{date}</div>
    </div>
    <button
      onClick={onDetails}
      className="text-sm text-gray-700 hover:text-gray-900"
    >
      Détails ›
    </button>
  </div>
);

const AllergiesSection = ({ allergies, onAdd, onDetails }) => {
  return (
    <section className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Allergies</h2>
        <div className="space-y-4">
          {allergies.map((allergy, index) => (
            <AllergyItem
              key={index}
              type={allergy.type}
              date={allergy.date}
              onDetails={() => onDetails(allergy)}
            />
          ))}
        </div>
        <button
          onClick={onAdd}
          className="mt-6 w-full py-4 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors"
        >
          Ajouter une allergie
        </button>
      </div>
    </section>
  );
};

export default AllergiesSection;
