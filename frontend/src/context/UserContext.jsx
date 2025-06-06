import React, { createContext, useContext } from "react";

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Ces données seront plus tard récupérées depuis l'API
  const userData = {
    firstName: "Jean",
    lastName: "Dupont",
    fullName: "Jean Dupont",
    email: "jean.dupont@email.com",
    phone: "+33 6 12 34 56 78",
    username: "jeandupont",
  };

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
};
