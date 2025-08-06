/**
 * Service pour gérer les photos d'utilisateur
 * Ce service nécessite une instance API authentifiée
 */

const createUserPhotoService = (api) => {
  return {
    /**
     * Génère l'URL complète d'une photo d'utilisateur
     */
    getPhotoUrl: (photoPath) => {
      if (!photoPath || photoPath.trim() === "") {
        return null;
      }
      
      // Utilise une URL relative pour que nginx puisse faire le proxy
      const baseUrl = "";
      
      if (photoPath.startsWith("/")) {
        return `${baseUrl}${photoPath}`;
      } else {
        return `${baseUrl}/uploads/photos/${photoPath}`;
      }
    },

    /**
     * Génère l'URL de photo de profil par défaut basée sur le nom
     */
    getDefaultPhotoUrl: (fullName) => {
      if (!fullName) return null;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=7c3aed&color=fff&size=96`;
    },

    /**
     * Met à jour la photo de profil de l'utilisateur
     */
    updateProfilePhoto: async (formData) => {
      try {
        const response = await api.put("/users/profile-photo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo de profil:", error);
        throw error;
      }
    },

    /**
     * Supprime la photo de profil de l'utilisateur
     */
    deleteProfilePhoto: async () => {
      try {
        const response = await api.delete("/users/profile-photo");
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la suppression de la photo de profil:", error);
        throw error;
      }
    },
  };
};

export default createUserPhotoService; 