import {
  getAllMedecinsService,
  getMedecinByIdService,
  getProfileService,
  createOrUpdateProfileService,
  searchMedecinsService,
  getMedecinIdByUserIdService,
  getMedecinsBySpecialiteService,
  getAllSpecialitesService,
} from "./medecin.service.js";

/**
 * Controller pour la gestion des médecins
 * Orchestre les requêtes HTTP et utilise les services
 */

// Récupérer tous les médecins
export const getAllMedecins = async (req, res, next) => {
  try {
    const medecins = await getAllMedecinsService();
    res.status(200).json(medecins);
  } catch (error) {
    console.error("Erreur lors de la récupération des médecins:", error);
    next(error);
  }
};

// Récupérer un médecin par son ID utilisateur
export const getMedecinById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medecin = await getMedecinByIdService(id);

    if (!medecin) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    res.status(200).json(medecin);
  } catch (error) {
    console.error("Erreur lors de la récupération du médecin:", error);
    next(error);
  }
};

// Récupérer le profil du médecin connecté
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId; // Récupéré du middleware d'authentification
    const medecin = await getProfileService(userId);

    if (!medecin) {
      return res.status(404).json({ message: "Profil médecin non trouvé" });
    }

    res.status(200).json({ medecin });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil médecin:", error);
    next(error);
  }
};

// Créer ou mettre à jour le profil d'un médecin
export const createOrUpdateProfile = async (req, res, next) => {
  try {
    const profileData = req.body;
    const requesterId = req.userId;
    const requesterRole = req.userRole;

    const medecin = await createOrUpdateProfileService(
      profileData,
      requesterId,
      requesterRole
    );

    res.status(200).json({ medecin });
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour du profil médecin:",
      error
    );

    // Gestion spécifique des erreurs métier
    if (error.message === "Vous n'êtes pas autorisé à modifier ce profil") {
      return res.status(403).json({ message: error.message });
    }

    next(error);
  }
};

// Rechercher des médecins par spécialité, nom ou prénom
export const searchMedecins = async (req, res, next) => {
  try {
    const { q } = req.query;
    const medecins = await searchMedecinsService(q);

    res.status(200).json(medecins);
  } catch (error) {
    console.error("Erreur lors de la recherche de médecins:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Paramètre de recherche requis") {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

// Récupérer l'ID médecin à partir de l'ID utilisateur
export const getMedecinIdByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await getMedecinIdByUserIdService(userId);

    if (!result) {
      return res.status(404).json({
        message: "Médecin non trouvé pour cet utilisateur",
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du médecin:", error);
    next(error);
  }
};

// Récupérer les médecins par spécialité
export const getMedecinsBySpecialite = async (req, res, next) => {
  try {
    const { specialite } = req.params;
    const result = await getMedecinsBySpecialiteService(specialite);

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des médecins par spécialité:",
      error
    );
    next(error);
  }
};

// Récupérer toutes les spécialités disponibles
export const getAllSpecialites = async (req, res, next) => {
  try {
    const specialites = await getAllSpecialitesService();
    res.status(200).json(specialites);
  } catch (error) {
    console.error("Erreur lors de la récupération des spécialités:", error);
    next(error);
  }
};
