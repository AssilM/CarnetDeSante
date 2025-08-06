import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { httpService } from "../services/http";
import { createVaccinService } from "../services/api";
import { useAuth } from "./AuthContext";
import { useAppContext } from "./AppContext";

const VaccinationContext = createContext();

export const VaccinationProvider = ({ children }) => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { currentUser } = useAuth();
  const { showNotification } = useAppContext();
  
  // Créer une instance du service de vaccins
  const vaccinService = createVaccinService(httpService);

  // Charger les vaccins depuis le backend
  const fetchVaccines = useCallback(async () => {
    if (!currentUser || hasLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const vaccins = await vaccinService.getMyVaccines();
      
      // Vérifier que vaccins est bien un tableau avant d'appeler map
      if (!Array.isArray(vaccins)) {
        console.warn("L'API a retourné des données non-array pour les vaccins:", vaccins);
        setVaccines([]);
        setHasLoaded(true);
        return;
      }
      
      // Adapter le format pour le front
      setVaccines(
        vaccins.map((vaccin) => ({
          id: vaccin.id.toString(),
          name: vaccin.nom_vaccin,
          date: vaccin.date_vaccination,
          doctor: vaccin.nom_medecin || "",
          location: vaccin.lieu_vaccination || "",
          type: vaccin.type_vaccin || "",
          manufacturer: vaccin.fabricant || "",
          lot: vaccin.lot_vaccin || "",
          status: vaccin.statut || "effectué",
          notes: vaccin.notes || "",
          raw: vaccin,
        }))
      );
      setHasLoaded(true);
    } catch (err) {
      console.error("Erreur lors du chargement des vaccins:", err);
      setError("Erreur lors du chargement des vaccinations");
      setVaccines([]); // Initialiser avec un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, [currentUser, hasLoaded, vaccinService]);

  useEffect(() => {
    if (currentUser && !hasLoaded) {
      fetchVaccines();
    }
  }, [currentUser, hasLoaded, fetchVaccines]);

  // Ajouter un vaccin
  const addVaccine = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Préparer les données pour l'API
      const vaccinData = {
        nom_vaccin: data.name,
        date_vaccination: data.date,
        nom_medecin: data.doctor || null,
        lieu_vaccination: data.location || null,
        type_vaccin: data.type || null,
        fabricant: data.manufacturer || null,
        lot_vaccin: data.lotNumber || null,
        notes: data.notes || null,
        statut: data.statut || "effectué",
      };

      // Utiliser le service de vaccins
      await vaccinService.createVaccine(vaccinData);
      
      setHasLoaded(false); // Permettre le rechargement
      await fetchVaccines(); // Recharger la liste
      showNotification({
        type: "success",
        message: "Vaccin ajouté avec succès !",
        autoClose: true,
      });
      return true;
    } catch (err) {
      console.error("Erreur lors de l'ajout du vaccin:", err);
      setError("Erreur lors de l'ajout du vaccin");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un vaccin pour voir les détails
  const selectItem = (item) => setSelectedItem(item);
  const clearSelectedItem = () => setSelectedItem(null);

  // Pin/unpin (optionnel, à implémenter si besoin)
  const togglePinned = async (id) => {
    try {
      await vaccinService.togglePinned(id);
      // Recharger les vaccins pour avoir les données à jour
      setHasLoaded(false);
      await fetchVaccines();
    } catch (err) {
      console.error("Erreur lors du changement de statut épinglé:", err);
      showNotification({
        type: "error",
        message: "Erreur lors du changement de statut épinglé",
        autoClose: true,
      });
    }
  };

  // Supprimer un vaccin
  const deleteVaccine = async (vaccineId) => {
    setLoading(true);
    setError(null);
    try {
      await vaccinService.deleteVaccine(vaccineId);
      
      // Recharger la liste des vaccins
      setHasLoaded(false);
      await fetchVaccines();
      
      showNotification({
        type: "success",
        message: "Vaccin supprimé avec succès !",
        autoClose: true,
      });
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du vaccin:", err);
      setError("Erreur lors de la suppression du vaccin");
      showNotification({
        type: "error",
        message: "Impossible de supprimer le vaccin",
        autoClose: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <VaccinationContext.Provider
      value={{
        items: vaccines,
        loading,
        error,
        addItem: addVaccine,
        selectItem,
        clearSelectedItem,
        selectedItem,
        setItems: setVaccines, // pour compatibilité
        togglePinned,
        fetchVaccines,
        deleteVaccine,
      }}
    >
      {children}
    </VaccinationContext.Provider>
  );
};

export const useVaccinationContext = () => {
  const ctx = useContext(VaccinationContext);
  if (!ctx) throw new Error("useVaccinationContext must be used within VaccinationProvider");
  return ctx;
};
