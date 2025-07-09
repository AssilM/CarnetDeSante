import React from "react";
import { useAuth } from "../../../context";

const AgendaHeader = () => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-lg md:text-xl font-bold text-[#343A40] mb-1 md:mb-2">
          Agenda - Dr. {currentUser?.nom} {currentUser?.prenom}
        </h1>
        <p className="text-sm md:text-md text-[#6C757D]">
          {currentUser?.specialite}
        </p>
      </div>
    </div>
  );
};

export default AgendaHeader;
