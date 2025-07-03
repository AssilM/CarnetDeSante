import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMapMarkerAlt, FaStethoscope, FaSave, FaArrowLeft } from "react-icons/fa";
import PageWrapper from "../../components/PageWrapper";
import LocationPicker from "../../components/common/LocationPicker";
import { useAuth } from "../../context/AuthContext";
import { useUserContext } from "../../context/UserContext";
import { useAppContext } from "../../context/AppContext";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { user, updateUserInfo } = useUserContext();
  const { showSuccess, showError } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Informations personnelles
    prenom: "",
    nom: "",
    email: "",
    tel_indicatif: "+228",
    tel_numero: "",
    date_naissance: "",
    sexe: "",
    
    // Informations professionnelles
    specialite: "",
    description: "",
    
    // Informations de localisation
    adresse: "",
    ville: "",
    latitude: null,
    longitude: null,
    description_localisation: ""
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (user || currentUser) {
      const userData = user || currentUser;
      setFormData({
        prenom: userData.prenom || "",
        nom: userData.nom || "",
        email: userData.email || "",
        tel_indicatif: userData.tel_indicatif || "+228",
        tel_numero: userData.tel_numero || "",
        date_naissance: userData.date_naissance || "",
        sexe: userData.sexe || "",
        specialite: userData.specialite || "",
        description: userData.description || "",
        adresse: userData.adresse || "",
        ville: userData.ville || "Lomé",
        latitude: userData.latitude ? parseFloat(userData.latitude) : null,
        longitude: userData.longitude ? parseFloat(userData.longitude) : null,
        description_localisation: userData.description_localisation || ""
      });
    }
  }, [user, currentUser]);

  // Gérer les changements de champs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer les changements de localisation
  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      adresse: locationData.address,
      ville: locationData.city,
      description_localisation: locationData.description
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.latitude || !formData.longitude) {
      showError("Veuillez sélectionner votre localisation sur la carte");
      return;
    }

    if (!formData.description_localisation.trim()) {
      showError("Veuillez renseigner une description de votre localisation");
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API
      const updateData = {
        // Informations personnelles
        prenom: formData.prenom,
        nom: formData.nom,
        tel_indicatif: formData.tel_indicatif,
        tel_numero: formData.tel_numero,
        date_naissance: formData.date_naissance,
        sexe: formData.sexe,
        
        // Adresse avec géolocalisation
        adresse: formData.adresse,
        ville: formData.ville,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description_localisation: formData.description_localisation,
        
        // Informations professionnelles
        specialite: formData.specialite,
        description: formData.description
      };

      // Mettre à jour le profil
      await updateUserInfo(currentUser.id, updateData);
      
      showSuccess("Votre profil a été mis à jour avec succès");
      setIsEditing(false);
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      showError(
        error.response?.data?.message || 
        "Erreur lors de la mise à jour du profil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vérifier si la localisation est configurée
  const isLocationConfigured = formData.latitude && formData.longitude;

  return (
    <PageWrapper className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/doctor/home")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Retour au tableau de bord
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil Médecin</h1>
              <p className="text-gray-600 mt-2">
                Gérez vos informations professionnelles et votre localisation
              </p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Modifier le profil
              </button>
            )}
          </div>
        </div>

        {/* Alerte si localisation non configurée */}
        {!isLocationConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-yellow-500 mr-3" />
              <div>
                <h3 className="text-yellow-800 font-medium">
                  Localisation non configurée
                </h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Veuillez configurer la localisation de votre cabinet pour que les patients puissent vous trouver facilement.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUser className="mr-3 text-primary" />
              Informations personnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="flex space-x-2">
                  <select
                    name="tel_indicatif"
                    value={formData.tel_indicatif}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="+228">+228</option>
                    <option value="+33">+33</option>
                    <option value="+1">+1</option>
                  </select>
                  <input
                    type="tel"
                    name="tel_numero"
                    value={formData.tel_numero}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="90123456"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexe
                </label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Sélectionnez</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaStethoscope className="mr-3 text-primary" />
              Informations professionnelles
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité *
                </label>
                <select
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  required
                >
                  <option value="">Sélectionnez votre spécialité</option>
                  <option value="Médecine générale">Médecine générale</option>
                  <option value="Cardiologie">Cardiologie</option>
                  <option value="Dermatologie">Dermatologie</option>
                  <option value="Gynécologie">Gynécologie</option>
                  <option value="Pédiatrie">Pédiatrie</option>
                  <option value="Neurologie">Neurologie</option>
                  <option value="Orthopédie">Orthopédie</option>
                  <option value="Ophtalmologie">Ophtalmologie</option>
                  <option value="ORL">ORL</option>
                  <option value="Psychiatrie">Psychiatrie</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description professionnelle
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Décrivez votre expérience, vos domaines d'expertise..."
                />
              </div>
            </div>
          </div>

          {/* Localisation du cabinet */}
          {isEditing && (
            <LocationPicker
              onLocationChange={handleLocationChange}
              initialLocation={
                formData.latitude && formData.longitude 
                  ? { lat: formData.latitude, lng: formData.longitude }
                  : null
              }
              initialAddress={formData.adresse}
              userType="medecin"
            />
          )}

          {/* Affichage de la localisation actuelle */}
          {!isEditing && isLocationConfigured && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaMapMarkerAlt className="mr-3 text-primary" />
                Localisation du cabinet
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <p className="text-gray-900">{formData.ville}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coordonnées GPS
                  </label>
                  <p className="text-gray-900">
                    {formData.latitude && formData.longitude && 
                     typeof formData.latitude === 'number' && typeof formData.longitude === 'number'
                      ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                      : 'Non renseignées'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900">{formData.description_localisation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          {isEditing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
              >
                <FaSave className="mr-2" />
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          )}
        </form>
      </div>
    </PageWrapper>
  );
};

export default DoctorProfile;
