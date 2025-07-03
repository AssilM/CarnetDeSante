import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { useAppContext } from "../../../context/AppContext";
import { useAuth } from "../../../context/AuthContext";
import { FiArrowLeft, FiMapPin, FiHome, FiMap } from "react-icons/fi";
import PageWrapper from "../../../components/PageWrapper";
import LocationPicker from "../../../components/doctor/LocationPicker";

const EditAddress = () => {
  const navigate = useNavigate();
  const { user, updateUserInfo, error: userError } = useUserContext();
  const { showSuccess, showError } = useAppContext();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    adresse: user?.adresse || "",
    codePostal: user?.codePostal || "",
    ville: user?.ville || "",
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
    description_localisation: user?.description_localisation || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Vérifier si l'utilisateur est un médecin
  const isDoctor = currentUser?.role === "medecin" || user?.role === "medecin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gérer les changements de localisation pour les médecins
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation pour les médecins
    if (isDoctor) {
      if (!formData.latitude || !formData.longitude) {
        setError("Veuillez sélectionner votre localisation sur la carte");
        setLoading(false);
        return;
      }
      if (!formData.description_localisation.trim()) {
        setError("Veuillez renseigner une description de votre localisation");
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        adresse: formData.adresse,
        code_postal: formData.codePostal,
        ville: formData.ville,
      };

      // Ajouter les champs de géolocalisation pour les médecins
      if (isDoctor) {
        updateData.latitude = formData.latitude;
        updateData.longitude = formData.longitude;
        updateData.description_localisation = formData.description_localisation;
      }

      await updateUserInfo(user.id, updateData);

      // Afficher une notification de succès et rafraîchir la page
      showSuccess("Votre adresse a été mise à jour avec succès", true);

      // Rediriger vers la page des paramètres
      setTimeout(() => {
        navigate("/settings#connexion");
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'adresse:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour de l'adresse"
      );
      showError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour de l'adresse"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/settings#connexion")}
          className="flex items-center text-blue-600 mb-6 hover:text-blue-700"
        >
          <FiArrowLeft className="mr-2" />
          Retour aux paramètres
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold mb-6 flex items-center">
            <FiMapPin className="mr-3 text-blue-500" />
            {isDoctor ? "Modifier la localisation de mon cabinet" : "Modifier mon adresse"}
          </h1>

          {(error || userError) && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error || userError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Composant de localisation pour les médecins */}
            {isDoctor && (
              <LocationPicker
                onLocationChange={handleLocationChange}
                initialLocation={
                  formData.latitude && formData.longitude 
                    ? { lat: formData.latitude, lng: formData.longitude }
                    : null
                }
                initialAddress={formData.adresse}
                className="mb-6"
              />
            )}

            {/* Formulaire classique pour les patients */}
            {!isDoctor && (
              <>
                <div>
                  <label
                    htmlFor="adresse"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adresse
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHome className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 rue de la Paix"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="codePostal"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Code postal
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMap className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="codePostal"
                        name="codePostal"
                        value={formData.codePostal}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="75000"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="ville"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ville
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="ville"
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Paris"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate("/settings#connexion")}
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EditAddress;
