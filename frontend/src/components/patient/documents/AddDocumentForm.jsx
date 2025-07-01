import React, { useState } from "react";

const documentTypes = [
  { value: "ordonnance", label: "Ordonnance" },
  { value: "analyse", label: "Analyse" },
  { value: "radio", label: "Radiographie" },
  { value: "consultation", label: "Consultation" },
  { value: "autre", label: "Autre" },
];

/**
 * Formulaire d'ajout d'un document médical
 * @param {Function} onSubmit - Fonction appelée à la soumission du formulaire
 * @param {Function} onCancel - Fonction appelée pour annuler l'ajout
 */
const AddDocumentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titre: "",
    type_document: "",
    date_creation: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut
    description: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📋 [FORM] Soumission du formulaire avec:', {
      titre: formData.titre,
      type_document: formData.type_document,
      date_creation: formData.date_creation,
      description: formData.description,
      file: formData.file ? {
        name: formData.file.name,
        size: formData.file.size,
        type: formData.file.type
      } : null
    });
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Ajouter un document
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Titre du document
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: Radiographie du genou"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type de document
            </label>
            <select
              name="type_document"
              value={formData.type_document}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionnez un type</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date du document
            </label>
            <input
              type="date"
              name="date_creation"
              value={formData.date_creation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Description du document..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fichier
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
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

export default AddDocumentForm;
