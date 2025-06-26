import React from "react";
import { useNavigate } from "react-router-dom";
import { useAllergyContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import AddAllergyForm from "../../../components/patient/medical/forms/AddAllergyForm";

const AddAllergy = () => {
  const navigate = useNavigate();
  const { addItem } = useAllergyContext();

  const handleSubmit = (data) => {
    // Ajout d'un ID unique
    const newAllergy = {
      ...data,
      id: `allergy-${Date.now()}`,
      date: new Date().toLocaleDateString("fr-FR"),
    };

    // Ajout de l'allergie via le contexte
    addItem(newAllergy);
    console.log("Nouvelle allergie:", newAllergy);
    navigate("/medical-profile");
  };

  const handleCancel = () => {
    navigate("/medical-profile");
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="mt-10">
        <AddAllergyForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
};

export default AddAllergy;
