import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVaccinationContext } from "../../../context";
import { useAuth } from "../../../context/AuthContext";
import PageWrapper from "../../../components/PageWrapper";
import { ItemsList, ActionButton } from "../../../components/patient/common";
import AddVaccineForm from "../../../components/patient/vaccination/AddVaccineForm";
import { useFormModal } from "../../../hooks";
import { vaccinService } from "../../../services/api/vaccinService";

const Vaccination = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { selectItem, setItems, items, addItem, togglePinned } =
    useVaccinationContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utilisation du hook personnalisé pour gérer le formulaire d'ajout
  const {
    isOpen: showAddForm,
    openForm,
    closeForm,
    handleSubmit,
  } = useFormModal(async (data) => {
    try {
      console.log("Données du vaccin à envoyer:", data);
      console.log("Utilisateur connecté:", currentUser);
      
      // Vérifier que l'utilisateur est connecté
      if (!currentUser || !currentUser.id) {
        setError("Utilisateur non connecté");
        return;
      }
      
      // Préparer les données pour l'API
      const vaccinData = {
        patient_id: currentUser.id, // L'ID de l'utilisateur qui correspond à utilisateur_id dans patient
        nom_vaccin: data.nom_vaccin,
        nom_medecin: data.nom_medecin,
        lieu_vaccination: data.lieu_vaccination,
        type_vaccin: data.type_vaccin,
        fabricant: data.fabricant,
        date_vaccination: data.date_vaccination,
        lot_vaccin: data.lot_vaccin,
        statut: data.statut || 'administré',
        prochaine_dose: data.prochaine_dose || null,
        notes: data.notes || null,
      };

      console.log("Données formatées pour l'API:", vaccinData);

      // Envoyer à l'API
      const response = await vaccinService.createVaccin(vaccinData);
      console.log("Réponse de l'API:", response);

      if (response && response.success) {
        console.log("Vaccin créé avec succès, rechargement de la liste...");
        // Recharger la liste des vaccins depuis la base de données
        await loadVaccins();
      } else {
        console.error("Erreur dans la réponse:", response);
        setError(response.message || "Erreur lors de l'ajout du vaccin");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du vaccin:", error);
      setError(`Erreur lors de l'ajout du vaccin: ${error.message}`);
    }
  });

  // Charger les vaccins depuis la base de données
  const loadVaccins = async () => {
    console.log("loadVaccins appelé avec currentUser:", currentUser);
    
    if (!currentUser?.id) {
      console.log("Pas d'utilisateur connecté ou pas d'ID utilisateur");
      setLoading(false);
      setItems([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Chargement des vaccins pour patient_id:", currentUser.id);
      const response = await vaccinService.getVaccins(currentUser.id);
      console.log("Vaccins récupérés:", response);
      
      if (response && response.success) {
        // Formater les données pour la compatibilité avec l'interface
        const formattedVaccins = response.data.map(vaccin => ({
          ...vaccin,
          // Compatibilité avec l'ancien format
          id: vaccin.id.toString(),
          name: vaccin.nom_vaccin,
          date: new Date(vaccin.date_vaccination).toLocaleDateString("fr-FR"),
          doctor: vaccin.nom_medecin,
          location: vaccin.lieu_vaccination,
          type: vaccin.type_vaccin,
          manufacturer: vaccin.fabricant,
          subtitle: `Lot: ${vaccin.lot_vaccin}`,
          nextDose: vaccin.prochaine_dose ? 
            new Date(vaccin.prochaine_dose).toLocaleDateString("fr-FR") : null,
          pinned: false, // À gérer plus tard si nécessaire
        }));
        
        console.log("Vaccins formatés:", formattedVaccins);
        setItems(formattedVaccins);
      } else {
        // Si pas de données ou échec, initialiser avec un tableau vide
        setItems([]);
        console.log("Aucun vaccin trouvé ou erreur de récupération");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des vaccins:", error);
      // En cas d'erreur, initialiser avec un tableau vide au lieu d'afficher une erreur
      setItems([]);
      // Optionnel : afficher l'erreur seulement si c'est critique
      // setError("Erreur lors du chargement des vaccins");
    } finally {
      setLoading(false);
    }
  };

  // Charger les vaccins au montage du composant
  useEffect(() => {
    loadVaccins();
  }, [currentUser?.id]);

  const handleViewDetails = (vaccine) => {
    selectItem(vaccine);
    navigate("/vaccination/details");
  };

  const handleGenerateReport = () => {
    console.log("Générer le récapitulatif des vaccinations");
  };

  const handleTogglePin = (id) => {
    togglePinned(id);
  };

  const content = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Chargement des vaccins...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      );
    }

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
      <ItemsList
        items={items}
        type="vaccine"
        title="Vaccination"
        description="Permet de retrouver et d'ajouter des vaccins"
        onAdd={openForm}
        onViewDetails={handleViewDetails}
        onTogglePin={handleTogglePin}
        addButtonText="Ajouter un vaccin"
        rightAction={generateReportButton}
      />
    );
  };

  return <PageWrapper>{content()}</PageWrapper>;
};

export default Vaccination;
