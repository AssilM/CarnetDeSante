import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaTrash,
  FaPen,
  FaExclamationTriangle,
} from "react-icons/fa";
import PageWrapper from "../../components/PageWrapper";
import { useDoctorAvailability } from "../../context";
import { useAppContext } from "../../context";

const Availability = () => {
  const {
    availabilities,
    loading,
    error,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    getAvailabilitiesByDay,
    DAYS_OF_WEEK,
  } = useDoctorAvailability();
  const { showSuccess, showError } = useAppContext();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState(null);
  const [formData, setFormData] = useState({
    jour: "lundi",
    heure_debut: "08:00",
    heure_fin: "12:00",
  });
  const [validationError, setValidationError] = useState("");

  // Obtenir les disponibilités organisées par jour
  const availabilitiesByDay = getAvailabilitiesByDay();

  // Vérifier si une disponibilité chevauche une autre
  const checkOverlap = (jour, heure_debut, heure_fin, excludeId = null) => {
    // Convertir les heures en minutes pour faciliter la comparaison
    const startMinutes = convertTimeToMinutes(heure_debut);
    const endMinutes = convertTimeToMinutes(heure_fin);

    // Vérifier si l'heure de fin est après l'heure de début
    if (endMinutes <= startMinutes) {
      return "L'heure de fin doit être postérieure à l'heure de début";
    }

    // Filtrer les disponibilités du même jour
    const dayAvailabilities = availabilities.filter(
      (avail) =>
        avail.jour === jour && (excludeId === null || avail.id !== excludeId)
    );

    // Vérifier les chevauchements
    for (const avail of dayAvailabilities) {
      const availStartMinutes = convertTimeToMinutes(avail.heure_debut);
      const availEndMinutes = convertTimeToMinutes(avail.heure_fin);

      // Vérifier si les plages horaires se chevauchent
      if (
        (startMinutes < availEndMinutes && endMinutes > availStartMinutes) ||
        (availStartMinutes < endMinutes && availEndMinutes > startMinutes)
      ) {
        return `Cette disponibilité chevauche une disponibilité existante (${formatTime(
          avail.heure_debut
        )} - ${formatTime(avail.heure_fin)})`;
      }
    }

    return null; // Pas de chevauchement
  };

  // Convertir une heure au format HH:MM en minutes
  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Gérer la soumission du formulaire d'ajout
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Vérifier les chevauchements
    const overlapError = checkOverlap(
      formData.jour,
      formData.heure_debut,
      formData.heure_fin
    );

    if (overlapError) {
      setValidationError(overlapError);
      return;
    }

    try {
      await addAvailability(formData);
      showSuccess("Disponibilité ajoutée avec succès");
      setIsAddModalOpen(false);
      setValidationError("");
      setFormData({
        jour: "lundi",
        heure_debut: "08:00",
        heure_fin: "12:00",
      });
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Erreur lors de l'ajout de la disponibilité"
      );
    }
  };

  // Gérer la soumission du formulaire de modification
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Vérifier les chevauchements (en excluant la disponibilité actuelle)
    const overlapError = checkOverlap(
      formData.jour,
      formData.heure_debut,
      formData.heure_fin,
      currentAvailability.id
    );

    if (overlapError) {
      setValidationError(overlapError);
      return;
    }

    try {
      await updateAvailability(currentAvailability.id, formData);
      showSuccess("Disponibilité modifiée avec succès");
      setIsEditModalOpen(false);
      setValidationError("");
      setCurrentAvailability(null);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Erreur lors de la modification de la disponibilité"
      );
    }
  };

  // Ouvrir le modal d'édition avec les données de la disponibilité sélectionnée
  const openEditModal = (availability) => {
    setCurrentAvailability(availability);
    setFormData({
      jour: availability.jour,
      heure_debut: availability.heure_debut.substring(0, 5),
      heure_fin: availability.heure_fin.substring(0, 5),
    });
    setValidationError("");
    setIsEditModalOpen(true);
  };

  // Gérer la suppression d'une disponibilité
  const handleDelete = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette disponibilité ?")
    ) {
      try {
        await deleteAvailability(id);
        showSuccess("Disponibilité supprimée avec succès");
      } catch (err) {
        showError(
          err.response?.data?.message ||
            "Erreur lors de la suppression de la disponibilité"
        );
      }
    }
  };

  // Formater l'heure (HH:MM:SS -> HH:MM)
  const formatTime = (time) => {
    return time.substring(0, 5);
  };

  // Traduire les jours en français
  const translateDay = (day) => {
    const translations = {
      lundi: "Lundi",
      mardi: "Mardi",
      mercredi: "Mercredi",
      jeudi: "Jeudi",
      vendredi: "Vendredi",
      samedi: "Samedi",
      dimanche: "Dimanche",
    };
    return translations[day] || day;
  };

  // Trier les disponibilités par heure de début
  const sortAvailabilities = (availabilities) => {
    return [...availabilities].sort((a, b) => {
      return (
        convertTimeToMinutes(a.heure_debut) -
        convertTimeToMinutes(b.heure_debut)
      );
    });
  };

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">
            Mes disponibilités
          </h1>
          <button
            onClick={() => {
              setValidationError("");
              setIsAddModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <FaPlus className="mr-2" /> Ajouter une disponibilité
          </button>
        </div>

        {/* Guide d'utilisation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          <h3 className="font-semibold mb-2 flex items-center">
            <FaExclamationTriangle className="mr-2" /> Guide d'utilisation
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              Définissez vos disponibilités pour chaque jour de la semaine
            </li>
            <li>
              Les disponibilités ne peuvent pas se chevaucher sur un même jour
            </li>
            <li>
              Les patients pourront prendre rendez-vous uniquement pendant ces
              créneaux
            </li>
            <li>
              Vous pouvez ajouter plusieurs créneaux par jour (matin,
              après-midi, etc.)
            </li>
          </ul>
        </div>

        {/* Affichage des disponibilités par jour */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Chargement des disponibilités...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : availabilities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaCalendarAlt className="mx-auto text-4xl mb-4 text-gray-400" />
              <p>Vous n'avez pas encore défini de disponibilités.</p>
              <p>Cliquez sur "Ajouter une disponibilité" pour commencer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-blue-700 border-b pb-2">
                    {translateDay(day)}
                  </h3>
                  {availabilitiesByDay[day].length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Aucune disponibilité
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {sortAvailabilities(availabilitiesByDay[day]).map(
                        (availability) => (
                          <li
                            key={availability.id}
                            className="flex justify-between items-center bg-blue-50 p-3 rounded-md"
                          >
                            <span className="font-medium">
                              {formatTime(availability.heure_debut)} -{" "}
                              {formatTime(availability.heure_fin)}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(availability)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Modifier"
                              >
                                <FaPen />
                              </button>
                              <button
                                onClick={() => handleDelete(availability.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de disponibilité */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Ajouter une disponibilité
            </h2>

            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{validationError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Jour</label>
                <select
                  value={formData.jour}
                  onChange={(e) =>
                    setFormData({ ...formData, jour: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {translateDay(day)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Heure de début
                </label>
                <input
                  type="time"
                  value={formData.heure_debut}
                  onChange={(e) =>
                    setFormData({ ...formData, heure_debut: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Heure de fin</label>
                <input
                  type="time"
                  value={formData.heure_fin}
                  onChange={(e) =>
                    setFormData({ ...formData, heure_fin: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError("");
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification de disponibilité */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifier la disponibilité
            </h2>

            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{validationError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Jour</label>
                <select
                  value={formData.jour}
                  onChange={(e) =>
                    setFormData({ ...formData, jour: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {translateDay(day)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Heure de début
                </label>
                <input
                  type="time"
                  value={formData.heure_debut}
                  onChange={(e) =>
                    setFormData({ ...formData, heure_debut: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Heure de fin</label>
                <input
                  type="time"
                  value={formData.heure_fin}
                  onChange={(e) =>
                    setFormData({ ...formData, heure_fin: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError("");
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Availability;
