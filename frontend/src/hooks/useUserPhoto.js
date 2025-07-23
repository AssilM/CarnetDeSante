import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { createUserPhotoService } from '../services/api';

/**
 * Hook personnalisé pour gérer les photos d'utilisateur
 * Utilise le service userPhotoService pour générer les URLs des photos
 */
export const useUserPhoto = () => {
  const { currentUser } = useAuth();
  
  const userPhotoService = useMemo(() => {
    // Créer une instance factice du service pour les méthodes statiques
    return createUserPhotoService({});
  }, []);

  const getPhotoUrl = (photoPath) => {
    return userPhotoService.getPhotoUrl(photoPath);
  };

  const getCurrentUserPhotoUrl = () => {
    if (!currentUser?.chemin_photo) {
      return null;
    }
    return getPhotoUrl(currentUser.chemin_photo);
  };

  const getDefaultPhotoUrl = (fullName) => {
    return userPhotoService.getDefaultPhotoUrl(fullName);
  };

  const getCurrentUserDefaultPhotoUrl = () => {
    if (!currentUser) return null;
    
    const firstName = currentUser.prenom || "";
    const lastName = currentUser.nom || "";
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : "Utilisateur";
    
    return getDefaultPhotoUrl(fullName);
  };

  return {
    getPhotoUrl,
    getCurrentUserPhotoUrl,
    getDefaultPhotoUrl,
    getCurrentUserDefaultPhotoUrl,
  };
}; 