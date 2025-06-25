import React from "react";

const InfoCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("border-", "bg-")
            .replace("-500", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const InfoCardSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InfoCard
        title="Rendez-vous aujourd'hui"
        value="12"
        color="border-blue-500"
        icon={
          <svg
            className="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
        }
      />

      <InfoCard
        title="Nouveaux patients"
        value="5"
        color="border-green-500"
        icon={
          <svg
            className="w-6 h-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            ></path>
          </svg>
        }
      />

      <InfoCard
        title="Messages non lus"
        value="3"
        color="border-yellow-500"
        icon={
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
        }
      />
    </div>
  );
};

export default InfoCardSection;
