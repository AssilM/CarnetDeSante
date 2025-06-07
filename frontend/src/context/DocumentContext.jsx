import React, { createContext, useContext, useState } from "react";

const DocumentContext = createContext();

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error(
      "useDocumentContext doit être utilisé dans un DocumentProvider"
    );
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const value = {
    selectedDocument,
    setSelectedDocument,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
