import React from "react";
import { useNavigate } from "react-router-dom";
import { useMedicalInfoContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import EditInfoForm from "../../../components/patient/medical/forms/EditInfoForm";

const EditMedicalInfo = () => {
  const navigate = useNavigate();
  const { selectedItem, setSelectedItem } = useMedicalInfoContext();

  // Données de test (à remplacer par les données du contexte)
  const patientInfo = selectedItem || {
    firstName: "Jean",
    lastName: "Dupont",
    age: 30,
    gender: "H",
    bloodType: "A",
    height: 180,
    weight: 80,
  };

  const handleSubmit = (data) => {
    // Mise à jour des informations via le contexte
    setSelectedItem(data);
    console.log("Nouvelles informations:", data);
    navigate("/medical-profile");
  };

  const handleCancel = () => {
    navigate("/medical-profile");
  };

  return (
    <PageWrapper className="bg-gray-50">
      <div className="mt-10">
        <EditInfoForm
          initialData={patientInfo}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </PageWrapper>
  );
};

export default EditMedicalInfo;
