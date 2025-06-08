import React from "react";
import { useNavigate } from "react-router-dom";
import { useMedicalHistoryContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import ItemsList from "../../../components/patient/common/ItemsList";

const MedicalHistoryList = () => {
  const navigate = useNavigate();
  const { items, setSelectedItem, togglePinned } = useMedicalHistoryContext();

  const handleAdd = () => {
    navigate("/medical-profile/history/add");
  };

  const handleDetails = (item) => {
    setSelectedItem(item);
    navigate("/medical-profile/history/details");
  };

  const handleTogglePin = (id) => {
    togglePinned(id);
  };

  return (
    <PageWrapper>
      <ItemsList
        items={items}
        type="history"
        title="Antécédents médicaux"
        description="Liste de vos antécédents médicaux"
        onAdd={handleAdd}
        onViewDetails={handleDetails}
        onTogglePin={handleTogglePin}
        addButtonText="Ajouter un antécédent"
        backUrl="/medical-profile"
        itemNameField="type"
        detailsText="Détails"
      />
    </PageWrapper>
  );
};

export default MedicalHistoryList;
