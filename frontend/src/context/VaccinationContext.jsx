import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { httpService } from "../services/http";
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

  // Charger les vaccins depuis le backend
  const fetchVaccines = useCallback(async () => {
    if (!currentUser || hasLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const response = await httpService.get("/vaccins");
      const vaccins = response.data.vaccins || [];
      
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
    } finally {
      setLoading(false);
    }
  }, [currentUser, hasLoaded]);

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

      // Utiliser la nouvelle API vaccin
      const response = await httpService.post("/vaccins", vaccinData);
      
      if (response.data.success) {
        setHasLoaded(false); // Permettre le rechargement
        await fetchVaccines(); // Recharger la liste
        showNotification({
          type: "success",
          message: "Vaccin ajouté avec succès !",
          autoClose: true,
        });
        return true;
      } else {
        throw new Error("Erreur lors de l'ajout du vaccin");
      }
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
  const togglePinned = (id) => {
    setVaccines((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, pinned: !v.pinned } : v
      )
    );
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
