// Utilitaires pour le formatage des dates

/**
 * Formate une date au format français (dd/mm/yyyy)
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée au format français
 */
export const formatDateFrench = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString("fr-FR");
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return '';
  }
};

/**
 * Formate une date au format français avec heure (dd/mm/yyyy à HH:mm)
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée au format français avec heure
 */
export const formatDateTimeFrench = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date avec heure:', error);
    return '';
  }
};

/**
 * Formate une date au format français long (ex: 12 février 2022)
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée au format français long
 */
export const formatDateLongFrench = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date longue:', error);
    return '';
  }
};
