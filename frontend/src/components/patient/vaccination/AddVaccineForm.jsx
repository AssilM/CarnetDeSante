import React, { useState } from "react";

/**
 * Formulaire d'ajout d'un vaccin
 * @param {Function} onSubmit - Fonction appelée à la soumission du formulaire
 * @param {Function} onCancel - Fonction appelée pour annuler l'ajout
 */
const AddVaccineForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom_vaccin: "",
    nom_medecin: "",
    lieu_vaccination: "",
    type_vaccin: "",
    fabricant: "",
    date_vaccination: "",
    lot_vaccin: "",
    statut: "administré",
    prochaine_dose: "",
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
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Ajouter un vaccin
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Les champs marqués d'un * sont obligatoires
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom du vaccin*
            </label>
            <input
              type="text"
              name="nom_vaccin"
              value={formData.nom_vaccin}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom du médecin*
            </label>
            <input
              type="text"
              name="nom_medecin"
              value={formData.nom_medecin}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lieu de vaccination*
            </label>
            <input
              type="text"
              name="lieu_vaccination"
              value={formData.lieu_vaccination}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type de vaccin*
            </label>
            <select
              name="type_vaccin"
              value={formData.type_vaccin}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="COVID-19">COVID-19</option>
              <option value="Grippe">Grippe</option>
              <option value="DTP">DTP (Diphtérie-Tétanos-Poliomyélite)</option>
              <option value="Hépatite B">Hépatite B</option>
              <option value="ROR">ROR (Rougeole-Oreillons-Rubéole)</option>
              <option value="Pneumocoque">Pneumocoque</option>
              <option value="Méningocoque">Méningocoque</option>
              <option value="HPV">HPV (Papillomavirus)</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fabricant*
            </label>
            <input
              type="text"
              name="fabricant"
              value={formData.fabricant}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="ex: Pfizer, Moderna, AstraZeneca..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de vaccination*
            </label>
            <input
              type="date"
              name="date_vaccination"
              value={formData.date_vaccination}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lot du vaccin*
            </label>
            <input
              type="text"
              name="lot_vaccin"
              value={formData.lot_vaccin}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="ex: ABC123, XYZ789..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="administré">Administré</option>
              <option value="planifié">Planifié</option>
              <option value="rappel_nécessaire">Rappel nécessaire</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prochaine dose (optionnel)
            </label>
            <input
              type="date"
              name="prochaine_dose"
              value={formData.prochaine_dose}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes (optionnel)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ajoutez des notes sur ce vaccin..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVaccineForm;
