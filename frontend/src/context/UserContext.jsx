import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { createUserService } from "../services/api";
import { httpService } from "../services/http";

// Créer une instance du service utilisateur
const userService = createUserService(httpService);

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données de l'utilisateur depuis l'API
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Si nous avons déjà les données de base de l'utilisateur depuis l'authentification
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
          latitude: currentUser.latitude,
          longitude: currentUser.longitude,
          description_localisation: currentUser.description_localisation || "",
        };

        setUserData(formattedUserData);
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
  }, [currentUser]);

  // Fonction pour mettre à jour les informations de l'utilisateur
  const updateUserInfo = async (userId, updatedData) => {
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
        latitude: response.user.latitude,
        longitude: response.user.longitude,
        description_localisation: response.user.description_localisation || "",
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

  return (
    <UserContext.Provider
      value={{
        user: userData,
        loading,
        error,
        updateUserInfo,
        updatePassword,
        getAllUsers: userService.getAllUsers,
        getUserById: userService.getUserById,
        getUsersByRole: userService.getUsersByRole,
        deleteUser: userService.deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
