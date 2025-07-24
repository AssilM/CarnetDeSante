import React from 'react';
import { useUserPhoto } from '../../hooks';

/**
 * Composant réutilisable pour afficher les photos d'utilisateur
 * Utilise le service userPhotoService pour gérer les URLs
 */
const UserPhoto = ({ 
  user, 
  size = 'md', 
  className = '', 
  showDefault = true,
  fallbackIcon = null 
}) => {
  const { getPhotoUrl, getDefaultPhotoUrl } = useUserPhoto();

  // Tailles prédéfinies
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Générer le nom complet pour l'avatar par défaut
  const getFullName = () => {
    if (!user) return 'Utilisateur';
    
    const firstName = user.prenom || user.firstName || '';
    const lastName = user.nom || user.lastName || '';
    return firstName && lastName ? `${firstName} ${lastName}` : 'Utilisateur';
  };

  // Obtenir l'URL de la photo
  const getPhotoSrc = () => {
    if (!user?.chemin_photo) {
      return showDefault ? getDefaultPhotoUrl(getFullName()) : null;
    }
    return getPhotoUrl(user.chemin_photo);
  };

  const photoSrc = getPhotoSrc();

  // Si pas de photo et pas de fallback, afficher un avatar avec les initiales
  if (!photoSrc && !fallbackIcon) {
    const fullName = getFullName();
    const initials = fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div 
        className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${className}`}
      >
        {initials}
      </div>
    );
  }

  // Si pas de photo mais avec fallback icon
  if (!photoSrc && fallbackIcon) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        {fallbackIcon}
      </div>
    );
  }

  // Afficher la photo
  return (
    <img
      src={photoSrc}
      alt={`Photo de ${getFullName()}`}
      className={`${sizeClass} rounded-full object-cover ${className}`}
      onError={(e) => {
        e.target.onerror = null;
        if (fallbackIcon) {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        } else if (showDefault) {
          e.target.src = getDefaultPhotoUrl(getFullName());
        }
      }}
    />
  );
};

export default UserPhoto; 