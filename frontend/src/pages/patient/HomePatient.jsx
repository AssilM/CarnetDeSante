import React from "react";
import WelcomeCard from "../../components/patient/home/WelcomeCard";
import HealthHistory from "../../components/patient/home/HealthHistory";
import DocumentsAndVaccinesWidget from "../../components/patient/home/DocumentsAndVaccinesWidget";
import PageWrapper from "../../components/PageWrapper";

const HomePatient = () => {
  return (
    <PageWrapper className="p-4 md:p-6 md:pl-16 ">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6">
        {/* Structure à deux colonnes verticales */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Colonne de gauche: WelcomeCard et HealthHistory */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 md:gap-6">
            {/* WelcomeCard en haut à gauche */}
            <div className="w-full p-4 md:p-6 rounded-lg">
              <WelcomeCard />
            </div>

            {/* HealthHistory en bas à gauche */}
            <div className="w-full">
              <HealthHistory />
            </div>
          </div>

          {/* Colonne de droite: DocumentsList */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 md:gap-6">
            {/* DocumentsAndVaccinesWidget - toujours visible */}
            <div className="w-full">
              <DocumentsAndVaccinesWidget />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HomePatient;
