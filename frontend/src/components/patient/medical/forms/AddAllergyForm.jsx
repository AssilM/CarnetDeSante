import React, { useState } from "react";

/**
 * Formulaire d'ajout d'une allergie
 * @param {Function} onSubmit - Fonction appelée à la soumission du formulaire
 * @param {Function} onCancel - Fonction appelée pour annuler l'ajout
 */
const AddAllergyForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "",
    allergen: "",
    severity: "moderate",
    symptoms: "",
    diagnosis: "",
    treatment: "",
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
        Ajouter une allergie
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type d'allergie
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionnez un type</option>
              <option value="food">Alimentaire</option>
              <option value="medication">Médicamenteuse</option>
              <option value="environmental">Environnementale</option>
              <option value="insect">Insectes</option>
              <option value="latex">Latex</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Allergène
            </label>
            <input
              type="text"
              name="allergen"
              value={formData.allergen}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Arachides, Pénicilline, Pollen..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sévérité
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="mild">Légère</option>
            <option value="moderate">Modérée</option>
            <option value="severe">Sévère</option>
            <option value="lifeThreatening">Potentiellement mortelle</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Symptômes
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Décrivez les symptômes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Diagnostic
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Comment l'allergie a-t-elle été diagnostiquée..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Traitement / Précautions
          </label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Traitements d'urgence, précautions à prendre..."
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

export default AddAllergyForm;
