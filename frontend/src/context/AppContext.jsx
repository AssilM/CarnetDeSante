import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDoctor, setIsDoctor] = useState(false); // false = patient, true = doctor
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <AppContext.Provider
      value={{
        isDoctor,
        setIsDoctor,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSidebarExpanded,
        setIsSidebarExpanded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
