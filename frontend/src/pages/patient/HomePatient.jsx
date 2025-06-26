import React from "react";
import WelcomeCard from "../../components/patient/home/WelcomeCard";
import InfoCardSection from "../../components/patient/home/InfoCardSection";
import HealthHistory from "../../components/patient/home/HealthHistory";
import DocumentsList from "../../components/patient/home/DocumentsList";
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
            <div className="w-full bg-blue-600 p-4 md:p-6 rounded-lg">
              <WelcomeCard />
            </div>

            {/* HealthHistory en bas à gauche */}
            <div className="w-full">
              <HealthHistory />
            </div>
          </div>

          {/* Colonne de droite: InfoCardSection et DocumentsList */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 md:gap-6">
            {/* InfoCardSection en haut à droite - caché sur mobile, visible à partir de md */}
            <div className="hidden md:block w-full">
              <InfoCardSection />
            </div>

            {/* DocumentsList en bas à droite - toujours visible */}
            <div className="w-full">
              <DocumentsList />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HomePatient;
