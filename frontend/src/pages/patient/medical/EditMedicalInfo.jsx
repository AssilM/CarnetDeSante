import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthContext";
import PageWrapper from "../../../components/PageWrapper";
import EditInfoForm from "../../../components/patient/medical/forms/EditInfoForm";

const EditMedicalInfo = () => {
  const navigate = useNavigate();
  const { user, updateUserInfo } = useUserContext();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Données initiales pour le formulaire
  const initialData = {
    prenom: user?.firstName || currentUser?.prenom || "",
    nom: user?.lastName || currentUser?.nom || "",
    date_naissance: user?.dateNaissance || currentUser?.date_naissance || "",
    sexe: user?.sexe || currentUser?.sexe || "",
    adresse: user?.adresse || currentUser?.adresse || "",
    code_postal: user?.codePostal || currentUser?.code_postal || "",
    ville: user?.ville || currentUser?.ville || "",
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Mapper les données du formulaire au format attendu par l'API
      const userData = {
        prenom: formData.prenom,
        nom: formData.nom,
        date_naissance: formData.date_naissance,
        sexe: formData.sexe,
        adresse: formData.adresse,
        code_postal: formData.code_postal,
        ville: formData.ville,
      };

      // Appeler l'API pour mettre à jour les informations
      await updateUserInfo(currentUser.id, userData);
      navigate("/medical-profile");
    } catch (err) {
      setError(
        err.message ||
          "Une erreur est survenue lors de la mise à jour des informations"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/medical-profile");
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="mt-10">
        {error && (
          <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <EditInfoForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </PageWrapper>
  );
};

export default EditMedicalInfo;
