import React from "react";
import { useAppContext } from "../context/AppContext";

const PageWrapper = ({ children, className = "" }) => {
  const { isSidebarExpanded } = useAppContext();

  return (
    <div
      className={`transition-all duration-300 
        ${isSidebarExpanded ? "md:pl-80" : "md:pl-28"}
        ${className}`}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
