import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { createUserService } from "../services/api";
import { httpService } from "../services/http"; // ✅ Utilisation directe

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userService, setUserService] = useState(null);

  // Créer l'instance du service - SIMPLIFIÉ
  useEffect(() => {
    // ✅ Utilisation directe de httpService - le refresh est automatique
    setUserService(createUserService(httpService));
  }, []); // ✅ Plus de dépendances complexes

  // Charger les données de l'utilisateur depuis l'API
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Nouvelle logique : toujours recharger les infos utilisateur depuis l'API
        if (userService) {
          const response = await userService.getUserById(currentUser.id);
          const user = response.user || currentUser;
          const formattedUserData = {
            id: user.id,
            firstName: user.prenom,
            lastName: user.nom,
            fullName: `${user.prenom} ${user.nom}`,
            email: user.email,
            telIndicatif: user.tel_indicatif || "+33",
            telNumero: user.tel_numero || "",
            username: `${user.prenom?.toLowerCase()}.${user.nom?.toLowerCase()}`,
            role: user.role,
            dateNaissance: user.date_naissance,
            sexe: user.sexe,
            adresse: user.adresse || "",
            codePostal: user.code_postal || "",
            ville: user.ville || "",
            chemin_photo: user.chemin_photo || "",
          };
          setUserData(formattedUserData);
        } else {
          // Fallback si userService pas prêt
          const formattedUserData = {
            id: currentUser.id,
            firstName: currentUser.prenom,
            lastName: currentUser.nom,
            fullName: `${currentUser.prenom} ${currentUser.nom}`,
            email: currentUser.email,
            telIndicatif: currentUser.tel_indicatif || "+33",
            telNumero: currentUser.tel_numero || "",
            username: `${currentUser.prenom?.toLowerCase()}.${currentUser.nom?.toLowerCase()}`,
            role: currentUser.role,
            dateNaissance: currentUser.date_naissance,
            sexe: currentUser.sexe,
            adresse: currentUser.adresse || "",
            codePostal: currentUser.code_postal || "",
            ville: currentUser.ville || "",
            chemin_photo: currentUser.chemin_photo || "",
          };
          setUserData(formattedUserData);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données utilisateur:",
          error
        );
        setError("Erreur lors du chargement des données utilisateur");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, userService]);

  // Fonction pour mettre à jour les informations de l'utilisateur
  const updateUserInfo = async (userId, updatedData) => {
    if (!userService) {
      setError("Service utilisateur non disponible");
      throw new Error("Service utilisateur non disponible");
    }

    try {
      setError(null);
      const response = await userService.updateUser(userId, updatedData);

      // Mettre à jour les données locales
      setUserData((prevData) => ({
        ...prevData,
        firstName: response.user.prenom,
        lastName: response.user.nom,
        fullName: `${response.user.prenom} ${response.user.nom}`,
        email: response.user.email,
        telIndicatif: response.user.tel_indicatif || "+33",
        telNumero: response.user.tel_numero || "",
        dateNaissance: response.user.date_naissance,
        sexe: response.user.sexe,
        adresse: response.user.adresse || "",
        codePostal: response.user.code_postal || "",
        ville: response.user.ville || "",
        chemin_photo: response.user.chemin_photo || prevData.chemin_photo || "",
      }));

      return response;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour des informations"
      );
      throw error;
    }
  };

  // Fonction pour mettre à jour le mot de passe
  const updatePassword = async (userId, currentPassword, newPassword) => {
    if (!userService) {
      setError("Service utilisateur non disponible");
      throw new Error("Service utilisateur non disponible");
    }

    try {
      setError(null);
      const response = await userService.updatePassword(userId, {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du mot de passe"
      );
      throw error;
    }
  };
  // Fonction pour mettre à jour la photo de profil
  const updateUserPhoto = async (userId, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await httpService.post(`/user/${userId}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Met à jour le contexte utilisateur avec le nouveau chemin_photo
    if (res.data && res.data.chemin_photo) {
      setUserData((prevData) => ({
        ...prevData,
        chemin_photo: res.data.chemin_photo,
      }));
      // Synchronise aussi le currentUser du AuthContext
      setCurrentUser((prev) => prev ? { ...prev, chemin_photo: res.data.chemin_photo } : prev);
    }
    return res.data;
  };
  // Fonctions wrapper pour les méthodes du service
  const getAllUsers = async (...args) => {
    if (!userService) throw new Error("Service utilisateur non disponible");
    return userService.getAllUsers(...args);
  };

  const getUserById = async (...args) => {
    if (!userService) throw new Error("Service utilisateur non disponible");
    return userService.getUserById(...args);
  };

  const getUsersByRole = async (...args) => {
    if (!userService) throw new Error("Service utilisateur non disponible");
    return userService.getUsersByRole(...args);
  };

  const deleteUser = async (...args) => {
    if (!userService) throw new Error("Service utilisateur non disponible");
    return userService.deleteUser(...args);
  };

  return (
    <UserContext.Provider
      value={{
        user: userData,
        loading,
        error,
        updateUserInfo,
        updatePassword,
        updateUserPhoto, // Ajout de la fonction pour l'upload photo
        getAllUsers,
        getUserById,
        getUsersByRole,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
