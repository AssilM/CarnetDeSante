import React, { useState } from "react";

const vaccineTypes = [
  "ARNm",
  "Inactivé",
  "Vivant atténué",
  "Sous-unitaire",
  "Conjugué",
  "Toxoïde",
  "Combiné",
  "Autre",
];

const manufacturers = [
  "Pfizer",
  "Moderna",
  "AstraZeneca",
  "Johnson & Johnson",
  "Sanofi",
  "GSK",
  "Merck",
  "Autre",
];

/**
 * Formulaire d'ajout d'un vaccin
 * @param {Function} onSubmit - Fonction appelée à la soumission du formulaire
 * @param {Function} onCancel - Fonction appelée pour annuler l'ajout
 */
const AddVaccineForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    manufacturer: "",
    date: "",
    doctor: "",
    location: "",
    lotNumber: "",
    nextDose: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Ajouter un vaccin
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom du vaccin
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: Vaccin COVID-19"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type de vaccin
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionnez un type</option>
              {vaccineTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fabricant
            </label>
            <select
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionnez un fabricant</option>
              {manufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de vaccination
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prochaine dose
            </label>
            <input
              type="date"
              name="nextDose"
              value={formData.nextDose}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Médecin
            </label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nom du médecin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lieu de vaccination
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nom de l'établissement"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Numéro de lot
          </label>
          <input
            type="text"
            name="lotNumber"
            value={formData.lotNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: ABC123"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes supplémentaires
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Informations complémentaires..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVaccineForm;
