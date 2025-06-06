import React from "react";
import { useAppContext } from "../context/AppContext";

const PageWrapper = ({ children, className = "" }) => {
  const { isSidebarExpanded } = useAppContext();

  return (
    <div
      className={`transition-all duration-300 
        ${isSidebarExpanded ? "md:pl-64" : "md:pl-16"}
        ${className}`}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
