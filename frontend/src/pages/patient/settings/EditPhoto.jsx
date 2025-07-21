import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { useAppContext } from "../../../context/AppContext";
import { FiArrowLeft, FiCamera } from "react-icons/fi";
import PageWrapper from "../../../components/PageWrapper";

const EditPhoto = () => {
  const navigate = useNavigate();
  const { user, updateUserPhoto, loading } = useUserContext();
  const { showSuccess, showError } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showError("Veuillez sélectionner une photo.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Appelle la fonction du context pour mettre à jour la photo
      await updateUserPhoto(user.id, selectedFile);
      showSuccess("Votre photo de profil a été mise à jour avec succès", true);
      setTimeout(() => {
        navigate("/settings#connexion");
      }, 2000);
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de la photo de profil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/settings#connexion")}
          className="flex items-center text-blue-600 mb-6 hover:text-blue-700"
        >
          <FiArrowLeft className="mr-2" />
          Retour aux paramètres
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold mb-6 flex items-center">
            <FiCamera className="mr-3 text-blue-500" />
            Modifier la photo de profil
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <img
                  src={
                    previewUrl ||
                    (user?.chemin_photo
                      ? `/${user.chemin_photo}`
                      : "/default-profile.png")
                  }
                  alt="Aperçu"
                  className="w-32 h-32 rounded-full object-cover border"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/settings#connexion")}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "En cours..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EditPhoto;