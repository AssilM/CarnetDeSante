import {
  getAllUsersService,
  getUserByIdService,
  getUsersByRoleService,
  updateUserService,
  updatePasswordService,
  deleteUserService,
} from "../services/user.service.js";

/**
 * Controller pour la gestion des utilisateurs
 * Orchestre les requêtes HTTP et utilise les services
 */

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    next(error);
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    next(error);
  }
};

// Récupérer les informations de l'utilisateur connecté
export const getMe = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await getUserByIdService(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    next(error);
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const updatedUser = await updateUserService(userId, updateData);

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Cet email est déjà utilisé") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Aucune donnée fournie pour la mise à jour") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

// Changer le mot de passe d'un utilisateur
export const updatePassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    await updatePasswordService(userId, currentPassword, newPassword);

    res.status(200).json({
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error);

    // Gestion spécifique des erreurs métier
    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Le mot de passe actuel est incorrect") {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await deleteUserService(userId);

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);

    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
};

// Récupérer les utilisateurs par rôle
export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const users = await getUsersByRoleService(role);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    next(error);
  }
};
