import React from "react";
import PageWrapper from "../../components/PageWrapper";

const MedicalProfile = () => {
  return (
    <PageWrapper className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Mon Profil Médical
        </h1>

        {/* Informations personnelles */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Informations Personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="text-lg">Jean Dupont</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="text-lg">15 Mars 1985</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Groupe sanguin</p>
              <p className="text-lg">A+</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Numéro de sécurité sociale
              </p>
              <p className="text-lg">1 85 03 75 123 456 78</p>
            </div>
          </div>
        </section>

        {/* Antécédents médicaux */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Antécédents Médicaux
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">Allergies</p>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li>Pénicilline</li>
                <li>Pollen</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">Maladies chroniques</p>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li>Asthme léger</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Traitements en cours */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Traitements en Cours
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Médicament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posologie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Ventoline</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    2 bouffées si besoin
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">01/01/2024</td>
                  <td className="px-6 py-4 whitespace-nowrap">En cours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default MedicalProfile;
