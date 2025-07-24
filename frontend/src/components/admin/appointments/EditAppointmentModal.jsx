import React, { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaSave } from "react-icons/fa";

const EditAppointmentModal = ({
  appointment,
  open,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    date: "",
    heure: "",
    motif: "",
    adresse: "",
    duree: 30,
  });

  useEffect(() => {
    if (appointment) {
      // Formater la date pour l'input date (YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch (error) {
          console.error("Erreur lors du formatage de la date:", error);
          return "";
        }
      };

      setFormData({
        date: formatDateForInput(appointment.date),
        heure: appointment.heure ? appointment.heure.substring(0, 5) : "",
        motif: appointment.motif || "",
        adresse: appointment.adresse || "",
        duree: appointment.duree || 30,
      });
    }
  }, [appointment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(appointment.id, formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaEdit className="text-blue-600 mr-2" />
            Modifier le rendez-vous
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure *
            </label>
            <input
              type="time"
              name="heure"
              value={formData.heure}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durée (minutes)
            </label>
            <input
              type="number"
              name="duree"
              value={formData.duree}
              onChange={handleChange}
              min="15"
              max="180"
              step="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif
            </label>
            <textarea
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Motif de la consultation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adresse du rendez-vous..."
            />
          </div>

          {appointment && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Informations actuelles :
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Patient :</strong> {appointment.patient_prenom}{" "}
                  {appointment.patient_nom}
                </p>
                <p>
                  <strong>Médecin :</strong> Dr. {appointment.medecin_prenom}{" "}
                  {appointment.medecin_nom}
                </p>
                <p>
                  <strong>Statut :</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      appointment.statut === "confirmé"
                        ? "bg-green-100 text-green-800"
                        : appointment.statut === "planifié"
                        ? "bg-blue-100 text-blue-800"
                        : appointment.statut === "annulé"
                        ? "bg-red-100 text-red-800"
                        : appointment.statut === "en_cours"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {appointment.statut}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaSave />
              )}
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
