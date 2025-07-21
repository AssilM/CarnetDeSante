import React, { useState, useEffect } from "react";
import {
  FaTimesCircle,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTag,
  FaHeartbeat,
  FaStethoscope,
  FaShieldAlt,
} from "react-icons/fa";

const EditUserModal = ({ user, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel_indicatif: "",
    tel_numero: "",
    adresse: "",
    code_postal: "",
    ville: "",
    // Détails spécifiques selon le rôle
    patient_details: {
      groupe_sanguin: "",
      taille: "",
      poids: "",
    },
    medecin_details: {
      specialite: "",
      description: "",
    },
    admin_details: {
      niveau_acces: "",
    },
  });

  const [errors, setErrors] = useState({});

  // Initialiser le formulaire avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        tel_indicatif: user.tel_indicatif || "",
        tel_numero: user.tel_numero || "",
        adresse: user.adresse || "",
        code_postal: user.code_postal || "",
        ville: user.ville || "",
        // Détails spécifiques selon le rôle
        patient_details: {
          groupe_sanguin: user.patient_details?.groupe_sanguin || "",
          taille: user.patient_details?.taille || "",
          poids: user.patient_details?.poids || "",
        },
        medecin_details: {
          specialite: user.medecin_details?.specialite || "",
          description: user.medecin_details?.description || "",
        },
        admin_details: {
          niveau_acces: user.admin_details?.niveau_acces || "",
        },
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleDetailChange = (detailType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [detailType]: {
        ...prev[detailType],
        [field]: value,
      },
    }));

    // Effacer l'erreur du champ modifié
    const errorKey = `${detailType}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (formData.tel_numero && !formData.tel_indicatif) {
      newErrors.tel_indicatif =
        "L'indicatif est requis si un numéro est fourni";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Préparer les données à envoyer
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        tel_indicatif: formData.tel_indicatif,
        tel_numero: formData.tel_numero,
        adresse: formData.adresse,
        code_postal: formData.code_postal,
        ville: formData.ville,
      };

      // Ajouter les détails spécifiques selon le rôle
      if (user.role === "patient") {
        dataToSend.patient_details = formData.patient_details;
      } else if (user.role === "medecin") {
        dataToSend.medecin_details = formData.medecin_details;
      } else if (user.role === "admin") {
        dataToSend.admin_details = formData.admin_details;
      }

      await onSave(user.id, dataToSend);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="bg-[#002846] text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <FaUser className="text-[#002846] text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Modifier l'utilisateur</h2>
                <p className="text-sm opacity-80">
                  {user.prenom} {user.nom} - ID: {user.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTimesCircle size={20} />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center">
                <FaUser className="mr-2 text-[#4A90E2]" />
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) =>
                      handleInputChange("prenom", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] ${
                      errors.prenom ? "border-red-500" : "border-[#E9ECEF]"
                    }`}
                    placeholder="Prénom"
                  />
                  {errors.prenom && (
                    <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] ${
                      errors.nom ? "border-red-500" : "border-[#E9ECEF]"
                    }`}
                    placeholder="Nom"
                  />
                  {errors.nom && (
                    <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-[#4A90E2]" />
                Contact
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] ${
                      errors.email ? "border-red-500" : "border-[#E9ECEF]"
                    }`}
                    placeholder="email@exemple.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Indicatif téléphonique
                    </label>
                    <input
                      type="text"
                      value={formData.tel_indicatif}
                      onChange={(e) =>
                        handleInputChange("tel_indicatif", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] ${
                        errors.tel_indicatif
                          ? "border-red-500"
                          : "border-[#E9ECEF]"
                      }`}
                      placeholder="+33"
                    />
                    {errors.tel_indicatif && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.tel_indicatif}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      type="text"
                      value={formData.tel_numero}
                      onChange={(e) =>
                        handleInputChange("tel_numero", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                      placeholder="123456789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-[#4A90E2]" />
                Adresse
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) =>
                      handleInputChange("adresse", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                    placeholder="123 Rue de la Paix"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.code_postal}
                      onChange={(e) =>
                        handleInputChange("code_postal", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                      placeholder="75001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) =>
                        handleInputChange("ville", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                      placeholder="Paris"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rôle (affichage en lecture seule) */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center">
                <FaUserTag className="mr-2 text-[#4A90E2]" />
                Rôle
              </h3>

              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">
                  Rôle de l'utilisateur
                </label>
                <div className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg bg-gray-50 text-[#64748B]">
                  {user.role === "admin"
                    ? "Administrateur"
                    : user.role === "medecin"
                    ? "Médecin"
                    : user.role === "patient"
                    ? "Patient"
                    : user.role}
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Le rôle ne peut pas être modifié
                </p>
              </div>
            </div>

            {/* Détails spécifiques selon le rôle */}
            {user.role === "patient" && (
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center">
                  <FaHeartbeat className="mr-2 text-[#4A90E2]" />
                  Informations médicales
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Groupe sanguin
                    </label>
                    <select
                      value={formData.patient_details.groupe_sanguin}
                      onChange={(e) =>
                        handleDetailChange(
                          "patient_details",
                          "groupe_sanguin",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                    >
                      <option value="">Sélectionner</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.patient_details.taille}
                      onChange={(e) =>
                        handleDetailChange(
                          "patient_details",
                          "taille",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                      placeholder="175"
                      min="100"
                      max="250"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.patient_details.poids}
                      onChange={(e) =>
                        handleDetailChange(
                          "patient_details",
                          "poids",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                      placeholder="70"
                      min="20"
                      max="300"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}

            {user.role === "medecin" && (
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center">
                  <FaStethoscope className="mr-2 text-[#4A90E2]" />
                  Informations professionnelles
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Spécialité
                    </label>
                    <input
                      type="text"
                      value={formData.medecin_details.specialite}
                      onChange={(e) =>
                        handleDetailChange(
                          "medecin_details",
                          "specialite",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                      placeholder="Cardiologie"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.medecin_details.description}
                      onChange={(e) =>
                        handleDetailChange(
                          "medecin_details",
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                      placeholder="Description de la spécialité..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {user.role === "admin" && (
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center">
                  <FaShieldAlt className="mr-2 text-[#4A90E2]" />
                  Niveau d'accès
                </h3>

                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-2">
                    Niveau d'accès
                  </label>
                  <select
                    value={formData.admin_details.niveau_acces}
                    onChange={(e) =>
                      handleDetailChange(
                        "admin_details",
                        "niveau_acces",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="standard">Standard</option>
                    <option value="elevé">Élevé</option>
                    <option value="super">Super</option>
                  </select>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-[#E9ECEF]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-[#64748B] hover:text-[#343A40] rounded-lg border border-[#E9ECEF] hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#3A80D2] disabled:opacity-50 flex items-center transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
