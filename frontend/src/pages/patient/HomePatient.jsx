import React from "react";
import WelcomeCard from "../../components/patient/home/WelcomeCard";
import SearchBar from "../../components/patient/home/SearchBar";
import InfoCardSection from "../../components/patient/home/InfoCardSection";
import HealthHistory from "../../components/patient/home/HealthHistory";
import DocumentsList from "../../components/patient/home/DocumentsList";
import PageWrapper from "../../components/PageWrapper";

const HomePatient = () => {
  return (
    <PageWrapper className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6">
        {/* Section supérieure : WelcomeCard et SearchBar */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <div className="w-full lg:w-1/2 bg-blue-600 p-4 md:p-6 rounded-lg">
            <WelcomeCard />
          </div>
          <div className="w-full lg:w-1/2 bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <SearchBar />
          </div>
        </div>

        {/* Section principale avec InfoCards, Historique et Documents */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Colonne de gauche : InfoCards et Historique */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 md:gap-6">
            <InfoCardSection />
            <HealthHistory />
          </div>
          {/* Colonne de droite : Documents */}
          <div className="w-full lg:w-1/2">
            <DocumentsList />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HomePatient;
