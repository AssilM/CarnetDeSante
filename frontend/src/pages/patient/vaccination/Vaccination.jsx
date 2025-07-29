import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSyringe } from "react-icons/fa";
import { useVaccinationContext } from "../../../context";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList, ActionButton } from "../../../components/patient/common";
import AddVaccineForm from "../../../components/patient/vaccination/AddVaccineForm";
import { useFormModal } from "../../../hooks";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useAuth } from "../../../context/AuthContext";

const Vaccination = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    selectItem,
    setItems,
    items,
    addItem,
    loading,
    error,
    fetchVaccines,
  } = useVaccinationContext();

  // Utilisation du hook personnalisé pour gérer le formulaire d'ajout
  const {
    isOpen: showAddForm,
    openForm,
    closeForm,
    handleSubmit,
  } = useFormModal(async (data) => {
    await addItem(data);
    closeForm();
  });

  // Charger les vaccins au montage (si besoin)
  useEffect(() => {
    fetchVaccines();
    // eslint-disable-next-line
  }, []);

  const handleViewDetails = (vaccine) => {
    selectItem(vaccine);
    navigate("/vaccination/details");
  };

  const handleGenerateReport = async () => {
    if (!items || items.length === 0) return;
    
    const doc = new jsPDF();
    
    // Couleurs
    const primaryColor = [124, 58, 237]; // Violet
    const lightGray = [245, 245, 245];
    
    // En-tête avec rectangle coloré
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Titre principal multi-ligne si besoin
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const title = `Récapitulatif des vaccins de ${currentUser?.prenom} ${currentUser?.nom}`;
    // Découper le titre en lignes de max 35 caractères sans couper les mots
    const splitTitle = (str, maxLen) => {
      const words = str.split(' ');
      const lines = [];
      let current = '';
      for (const word of words) {
        if ((current + ' ' + word).trim().length > maxLen) {
          lines.push(current.trim());
          current = word;
        } else {
          current += ' ' + word;
        }
      }
      if (current) lines.push(current.trim());
      return lines;
    };
    const titleLines = splitTitle(title, 35);
    let titleY = 25;
    titleLines.forEach((line, i) => {
      doc.text(line, 20, titleY + i * 8);
    });

    // Sous-titre (sous la dernière ligne du titre)
    doc.setFontSize(10);
    doc.text(`Généré le : ${dayjs().locale("fr").format("DD/MM/YYYY à HH:mm")}`, 20, titleY + titleLines.length * 8 + 2);

    // (Photo de profil/avatar supprimée du récapitulatif)
    
    // Informations du patient
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Patient : ${currentUser?.prenom} ${currentUser?.nom}`, 20, 55);
    doc.text(`Email : ${currentUser?.email}`, 20, 62);
    doc.text(`Total des vaccins : ${items.length}`, 20, 69);
    
    // Séparateur
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    
    let yPosition = 90;
    const lineHeight = 7;
    const marginLeft = 20;
    
    items.forEach((vaccin, index) => {
      // Calcul dynamique de la hauteur de l'encadré
      const baseLines = 6; // nombre de lignes d'infos fixes
      const hasNotes = !!vaccin.notes;
      const boxLines = baseLines + (hasNotes ? 1 : 0);
      const boxHeight = 12 + (boxLines * lineHeight) + 8; // 12 pour l'entête, 8 pour le padding bas

      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition + boxHeight > 270) {
        doc.addPage();
        yPosition = 20;
        // En-tête de page suivante
        doc.setFillColor(...lightGray);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Suite - ${currentUser?.prenom} ${currentUser?.nom}`, 20, 10);
      }

      // Encadré pour chaque vaccin (hauteur dynamique)
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(marginLeft - 5, yPosition - 5, 170, boxHeight, 3, 3, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.7);
      doc.roundedRect(marginLeft - 5, yPosition - 5, 170, boxHeight, 3, 3, 'S');

      // Numéro du vaccin
      doc.setFillColor(...primaryColor);
      doc.circle(marginLeft + 5, yPosition + 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(String(index + 1), marginLeft + 5, yPosition + 5);

      // Nom du vaccin (tronqué si trop long)
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const vaccineName = vaccin.name.length > 20 ? vaccin.name.substring(0, 20) + "..." : vaccin.name;
      doc.text(vaccineName, marginLeft + 15, yPosition + 5);

      // Statut avec badge
      const statusColor = vaccin.status === "effectué" ? [34, 197, 94] : [249, 115, 22];
      doc.setFillColor(...statusColor);
      doc.rect(marginLeft + 120, yPosition - 2, 25, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const statusText = vaccin.status === "effectué" ? "Effectué" : "À faire";
      doc.text(statusText, marginLeft + 122, yPosition + 3);

      // Informations du vaccin
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const infos = [
        `Date : ${dayjs(vaccin.date).locale("fr").format("DD/MM/YYYY")}`,
        `Vaccinateur : ${(vaccin.doctor || "Non renseigné").substring(0, 15)}`,
        `Lieu : ${(vaccin.location || "Non renseigné").substring(0, 15)}`,
        `Type : ${(vaccin.type || "Non renseigné").substring(0, 15)}`,
        `Fabricant : ${(vaccin.manufacturer || "Non renseigné").substring(0, 15)}`,
        `Lot : ${(vaccin.lot || "Non renseigné").substring(0, 15)}`,
      ];

      infos.forEach((info, i) => {
        doc.text(info, marginLeft + 5, yPosition + 12 + (i * lineHeight));
      });

      // Notes si présentes (tronquées)
      if (hasNotes) {
        const notes = vaccin.notes.length > 30 ? vaccin.notes.substring(0, 30) + "..." : vaccin.notes;
        doc.text(`Notes : ${notes}`, marginLeft + 5, yPosition + 12 + (baseLines * lineHeight));
      }

      yPosition += boxHeight + 10; // Espace dynamique entre les vaccins
    });
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(128, 128, 128);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Page ${i} sur ${pageCount}`, 20, 290);
      doc.text("Carnet de Santé - Vaccinations", 120, 290);
    }
    
    doc.save(`recap-vaccins-${currentUser?.prenom}-${currentUser?.nom}.pdf`);
  };

  const content = () => {
    if (showAddForm) {
      return (
        <div className="mt-10">
          <AddVaccineForm onSubmit={handleSubmit} onCancel={closeForm} />
        </div>
      );
    }

    const generateReportButton = (
      <ActionButton variant="secondary" onClick={handleGenerateReport}>
        Générer un récapitulatif
      </ActionButton>
    );

    return (
      <>
        {/* En-tête de la page avec icône et titre */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <FaSyringe className="text-2xl text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Vaccination
                  </h1>
                  <p className="text-sm text-gray-600">
                    Permet de retrouver et d'ajouter des vaccins
                  </p>
                </div>
              </div>
              {generateReportButton}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ItemsList
            items={items}
            type="vaccine"
            title="Vaccination"
            description="Permet de retrouver et d'ajouter des vaccins"
            onAdd={openForm}
            onViewDetails={handleViewDetails}
            addButtonText="Ajouter un vaccin"
            loading={loading}
            error={error}
            showPinnedSection={false}
          />
        </div>
        
      </>
    );
  };

  return <PageWrapper>{content()}</PageWrapper>;
};

export default Vaccination;
