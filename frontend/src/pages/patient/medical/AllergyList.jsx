import React from "react";
import { useNavigate } from "react-router-dom";
import { useAllergyContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import ItemsList from "../../../components/patient/common/ItemsList";

const AllergyList = () => {
  const navigate = useNavigate();
  const { items, setSelectedItem } = useAllergyContext();

  const handleAdd = () => {
    navigate("/medical-profile/allergies/add");
  };

  const handleDetails = (item) => {
    setSelectedItem(item);
    navigate("/medical-profile/allergies/details");
  };

  return (
    <PageWrapper>
      <ItemsList
        items={items}
        type="allergy"
        title="Allergies"
        description="Liste de vos allergies connues"
        onAdd={handleAdd}
        onViewDetails={handleDetails}
        addButtonText="Ajouter une allergie"
        backUrl="/medical-profile"
        itemNameField="type"
        detailsText="Détails"
      />
    </PageWrapper>
  );
};

export default AllergyList;
