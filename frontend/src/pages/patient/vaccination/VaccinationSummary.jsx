import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSyringe, FaArrowLeft, FaDownload, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { vaccinService } from "../../../services/api/vaccinService";
import PageWrapper from "../../../components/PageWrapper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const VaccinationSummary = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les vaccins
  useEffect(() => {
    loadVaccines();
  }, [currentUser?.id]);

  const loadVaccines = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Charger les vaccins
      const vaccinesResponse = await vaccinService.getVaccins(currentUser.id);
      
      if (vaccinesResponse && vaccinesResponse.success) {
        setVaccines(vaccinesResponse.data);
      } else {
        setVaccines([]);
      }

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/vaccination");
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Configuration des couleurs
      const primaryColor = [41, 128, 185]; // Bleu
      const secondaryColor = [52, 73, 94]; // Gris foncé
      const lightGray = [236, 240, 241]; // Gris clair
      
      // En-tête du document
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Titre
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("RÉCAPITULATIF DE VACCINATION", 20, 25);
      
      // Informations générales
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      let yPosition = 60;
      
      // Date de génération
      const today = new Date();
      doc.text(`Date de génération: ${today.toLocaleDateString("fr-FR")}`, 20, yPosition);
      yPosition += 15;
      
      // Tableau des vaccins
      if (vaccines.length > 0) {
        const tableData = vaccines.map(vaccine => [
          vaccine.nom_vaccin,
          new Date(vaccine.date_vaccination).toLocaleDateString("fr-FR"),
          vaccine.nom_medecin || "Non spécifié",
          vaccine.lieu_vaccination || "Non spécifié",
          vaccine.type_vaccin || "Non spécifié",
          vaccine.lot_vaccin || "Non spécifié"
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Vaccin', 'Date', 'Médecin', 'Lieu', 'Type', 'Lot']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: secondaryColor
          },
          alternateRowStyles: {
            fillColor: lightGray
          },
          margin: { left: 20, right: 20 }
        });
      } else {
        doc.text("Aucun vaccin enregistré", 20, yPosition);
      }
      
      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} sur ${pageCount}`, 20, doc.internal.pageSize.height - 10);
        doc.text(`Carnet de Santé Numérique - ${today.toLocaleDateString("fr-FR")}`, 
          doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      }
      
      // Télécharger le PDF
      const fileName = `Recapitulatif_Vaccination_${today.toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    }
  };

  // Calculer les statistiques
  const getTotalVaccines = () => vaccines.length;
  
  const getVaccinesByYear = () => {
    const vaccinesByYear = {};
    vaccines.forEach(vaccine => {
      const year = new Date(vaccine.date_vaccination).getFullYear();
      vaccinesByYear[year] = (vaccinesByYear[year] || 0) + 1;
    });
    return vaccinesByYear;
  };

  const getMostRecentVaccine = () => {
    if (vaccines.length === 0) return null;
    return vaccines.reduce((latest, vaccine) => {
      const vaccineDate = new Date(vaccine.date_vaccination);
      const latestDate = new Date(latest.date_vaccination);
      return vaccineDate > latestDate ? vaccine : latest;
    });
  };

  const getUpcomingVaccines = () => {
    const today = new Date();
    return vaccines.filter(vaccine => {
      const vaccinationDate = new Date(vaccine.date_vaccination);
      return vaccinationDate > today && vaccine.statut === 'planifié';
    });
  };

  if (loading) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Chargement du récapitulatif...</div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </PageWrapper>
    );
  }

  const recentVaccine = getMostRecentVaccine();
  const upcomingVaccines = getUpcomingVaccines();

  return (
    <PageWrapper className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux vaccinations
          </button>
          
          <button
            onClick={generatePDF}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FaDownload className="mr-2" />
            Télécharger PDF
          </button>
        </div>

        {/* Titre principal */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <FaSyringe className="text-3xl text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Récapitulatif de Vaccination
          </h1>
          <p className="text-gray-600">
            Aperçu complet de votre historique vaccinal
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {getTotalVaccines()}
            </div>
            <div className="text-gray-600">Vaccins administrés</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {upcomingVaccines.length}
            </div>
            <div className="text-gray-600">Vaccins à venir</div>
          </div>
        </div>

        {/* Dernier vaccin */}
        {recentVaccine && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Dernier vaccin administré
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FaSyringe className="text-primary" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{recentVaccine.nom_vaccin}</div>
                <div className="text-sm text-gray-600">
                  {new Date(recentVaccine.date_vaccination).toLocaleDateString("fr-FR")}
                </div>
                <div className="text-sm text-gray-600">
                  Dr. {recentVaccine.nom_medecin} - {recentVaccine.lieu_vaccination}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste complète des vaccins */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Historique complet des vaccinations
            </h2>
          </div>
          
          {vaccines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun vaccin enregistré
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaccin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médecin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccines
                    .sort((a, b) => new Date(b.date_vaccination) - new Date(a.date_vaccination))
                    .map((vaccine, index) => (
                      <tr key={vaccine.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-3">
                              <FaSyringe className="text-primary text-sm" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vaccine.nom_vaccin}
                              </div>
                              <div className="text-sm text-gray-500">
                                Lot: {vaccine.lot_vaccin || "Non spécifié"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(vaccine.date_vaccination).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vaccine.nom_medecin || "Non spécifié"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-gray-400 mr-1" />
                            {vaccine.lieu_vaccination || "Non spécifié"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vaccine.type_vaccin || "Non spécifié"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            vaccine.statut === 'administré' || !vaccine.statut ? 
                              'bg-green-100 text-green-800' :
                            vaccine.statut === 'planifié' ? 
                              'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                            {vaccine.statut || 'Administré'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vaccins à venir */}
        {upcomingVaccines.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vaccins à venir
            </h2>
            <div className="space-y-3">
              {upcomingVaccines.map((vaccine, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                      <FaSyringe className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {vaccine.nom_vaccin}
                      </div>
                      <div className="text-sm text-gray-600">
                        Planifié le {new Date(vaccine.date_vaccination).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    Planifié
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default VaccinationSummary;
