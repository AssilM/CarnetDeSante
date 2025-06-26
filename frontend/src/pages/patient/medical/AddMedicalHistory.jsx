import React from "react";
import { useNavigate } from "react-router-dom";
import { useMedicalHistoryContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import AddMedicalHistoryForm from "../../../components/patient/medical/forms/AddMedicalHistoryForm";

const AddMedicalHistory = () => {
  const navigate = useNavigate();
  const { addItem } = useMedicalHistoryContext();

  const handleSubmit = (data) => {
    // Ajout d'un ID unique
    const newHistory = {
      ...data,
      id: `history-${Date.now()}`,
      date: new Date().toLocaleDateString("fr-FR"),
    };

    // Ajout de l'antécédent via le contexte
    addItem(newHistory);
    console.log("Nouvel antécédent:", newHistory);
    navigate("/medical-profile");
  };

  const handleCancel = () => {
    navigate("/medical-profile");
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="mt-10">
        <AddMedicalHistoryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </PageWrapper>
  );
};

export default AddMedicalHistory;
