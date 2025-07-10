/**
 * Utilitaires de validation pour l'application
 * Centralise les fonctions de validation communes
 */

/**
 * Valide un format d'email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 * @param {string} numero - Numéro à valider
 * @returns {boolean} True si le numéro est valide
 */
export const isValidPhoneNumber = (numero) => {
  // Format français : 10 chiffres commençant par 0
  const phoneRegex = /^0[1-9](\d{8})$/;
  return phoneRegex.test(numero.replace(/\s/g, ""));
};

/**
 * Valide un code postal français
 * @param {string} codePostal - Code postal à valider
 * @returns {boolean} True si le code postal est valide
 */
export const isValidPostalCode = (codePostal) => {
  const postalRegex = /^[0-9]{5}$/;
  return postalRegex.test(codePostal);
};

/**
 * Valide la force d'un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} Objet avec isValid et messages d'erreur
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
  }

  if (!/\d/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide une date de naissance (doit être dans le passé et réaliste)
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {boolean} True si la date est valide
 */
export const isValidBirthDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120); // Max 120 ans

  return date < today && date > minDate;
};

/**
 * Valide un groupe sanguin
 * @param {string} groupeSanguin - Groupe sanguin à valider
 * @returns {boolean} True si le groupe sanguin est valide
 */
export const isValidBloodType = (groupeSanguin) => {
  const validTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  return validTypes.includes(groupeSanguin);
};

/**
 * Valide des mesures corporelles (taille, poids)
 * @param {number} taille - Taille en cm
 * @param {number} poids - Poids en kg
 * @returns {Object} Objet avec isValid et messages d'erreur
 */
export const validateBodyMeasurements = (taille, poids) => {
  const errors = [];

  if (taille && (taille < 50 || taille > 250)) {
    errors.push("La taille doit être comprise entre 50 et 250 cm");
  }

  if (poids && (poids < 1 || poids > 500)) {
    errors.push("Le poids doit être compris entre 1 et 500 kg");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Nettoie et formate un numéro de téléphone
 * @param {string} numero - Numéro à nettoyer
 * @returns {string} Numéro formaté
 */
export const formatPhoneNumber = (numero) => {
  return numero.replace(/\s/g, "").replace(/[^0-9]/g, "");
};

/**
 * Valide qu'une chaîne n'est pas vide après trim
 * @param {string} str - Chaîne à valider
 * @returns {boolean} True si la chaîne n'est pas vide
 */
export const isNotEmpty = (str) => {
  return typeof str === "string" && str.trim().length > 0;
};

/**
 * Valide la longueur d'une chaîne
 * @param {string} str - Chaîne à valider
 * @param {number} min - Longueur minimale
 * @param {number} max - Longueur maximale
 * @returns {boolean} True si la longueur est valide
 */
export const isValidLength = (str, min = 0, max = Infinity) => {
  if (typeof str !== "string") return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};
