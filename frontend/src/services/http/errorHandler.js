/**
 * Gestionnaire d'erreurs HTTP centralisé
 * Permet de formater et traiter les erreurs de manière cohérente
 */

// Mapper les codes d'erreur HTTP vers des messages utilisateur
const ERROR_MESSAGES = {
  400: "Requête incorrecte. Veuillez vérifier les données saisies.",
  401: "Session expirée. Veuillez vous reconnecter.",
  403: "Accès refusé. Vous n'avez pas les droits nécessaires.",
  404: "Ressource introuvable.",
  409: "Conflit avec l'état actuel de la ressource.",
  422: "Données invalides. Veuillez vérifier les informations saisies.",
  500: "Erreur serveur. Veuillez réessayer ultérieurement.",
  503: "Service indisponible. Veuillez réessayer plus tard.",
};

/**
 * Traite une erreur HTTP et retourne un message utilisateur approprié
 * @param {Object} error - L'erreur Axios
 * @returns {Object} Objet contenant le message d'erreur et les détails
 */
export const handleApiError = (error) => {
  // Extraire les informations pertinentes de l'erreur
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  const details = error.response?.data?.details || {};

  // Déterminer le message à afficher
  let userMessage =
    serverMessage || ERROR_MESSAGES[status] || "Une erreur est survenue.";

  return {
    message: userMessage,
    status,
    details,
    originalError: error,
  };
};

/**
 * Vérifie si l'erreur est due à une session expirée
 * @param {Object} error - L'erreur Axios
 * @returns {Boolean} True si la session est expirée
 */
export const isSessionExpired = (error) => {
  return error.response?.status === 401;
};

/**
 * Vérifie si l'erreur est due à un problème de connexion réseau
 * @param {Object} error - L'erreur Axios
 * @returns {Boolean} True si problème de connexion
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export default {
  handleApiError,
  isSessionExpired,
  isNetworkError,
};
