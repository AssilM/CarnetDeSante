import {
  getDisponibilitesByMedecinService,
  createDisponibiliteService,
  updateDisponibiliteService,
  deleteDisponibiliteService,
  getCreneauxDisponiblesService,
} from "./disponibilite.service.js";

/**
 * Controller pour la gestion des disponibilités
 * Orchestre les requêtes HTTP et utilise les services
 */

// Récupérer les disponibilités d'un médecin
export const getDisponibilitesByMedecinId = async (req, res, next) => {
  try {
    const { medecinId } = req.params;
    const disponibilites = await getDisponibilitesByMedecinService(medecinId);
    res.status(200).json(disponibilites);
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    next(error);
  }
};

// Créer une nouvelle disponibilité
export const createDisponibilite = async (req, res, next) => {
  try {
    const disponibiliteData = req.body;
    const auditInfo = {
      userId: req.userId,
      userRole: req.userRole,
    };

    const newDisponibilite = await createDisponibiliteService(
      disponibiliteData,
      auditInfo
    );

    res.status(201).json(newDisponibilite);
  } catch (error) {
    console.error("Erreur lors de la création de la disponibilité:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Médecin non trouvé") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes("disponibilité existe déjà") ||
      error.message.includes("créneau horaire")
    ) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

// Mettre à jour une disponibilité
export const updateDisponibilite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const auditInfo = {
      userId: req.userId,
      userRole: req.userRole,
    };

    const updatedDispo = await updateDisponibiliteService(
      id,
      updateData,
      auditInfo
    );

    res.status(200).json(updatedDispo);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Disponibilité non trouvée") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("chevauchement")) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

// Supprimer une disponibilité
export const deleteDisponibilite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const auditInfo = {
      userId: req.userId,
      userRole: req.userRole,
    };

    await deleteDisponibiliteService(id, auditInfo);
    res.status(200).json({ message: "Disponibilité supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la disponibilité:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Disponibilité non trouvée") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Erreur lors de la suppression") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

// Récupérer les créneaux disponibles pour un médecin à une date donnée
export const getCreneauxDisponibles = async (req, res, next) => {
  try {
    const { medecinId } = req.params;
    const { date } = req.query;
    const clientIp = req.ip;

    const result = await getCreneauxDisponiblesService(
      medecinId,
      date,
      clientIp
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des créneaux disponibles:",
      error
    );

    // Gestion spécifique des erreurs métier
    if (error.message === "Médecin non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};
