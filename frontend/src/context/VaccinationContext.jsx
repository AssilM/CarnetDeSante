import React, { createContext, useContext, useState } from "react";

const VaccinationContext = createContext();

export const useVaccinationContext = () => {
  const context = useContext(VaccinationContext);
  if (!context) {
    throw new Error(
      "useVaccinationContext doit être utilisé dans un VaccinationProvider"
    );
  }
  return context;
};

export const VaccinationProvider = ({ children }) => {
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  const value = {
    selectedVaccine,
    setSelectedVaccine,
  };

  return (
    <VaccinationContext.Provider value={value}>
      {children}
    </VaccinationContext.Provider>
  );
};
