import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthContext";
import { useAppContext } from "../../../context/AppContext";
import PageWrapper from "../../../components/PageWrapper";
import EditInfoForm from "../../../components/patient/medical/forms/EditInfoForm";

const EditMedicalInfo = () => {
  const navigate = useNavigate();
  const { user, updateUserInfo } = useUserContext();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Afficher une notification de succès et rafraîchir la page
      showSuccess("Vos informations ont été mises à jour avec succès", true);

      // Rediriger vers la page du profil médical avec rafraîchissement
      setTimeout(() => {
        navigate("/medical-profile", { replace: true });
        window.location.reload();
      }, 2000);
    } catch (err) {
      showError(
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
