/**
 * Middleware de validation pour les disponibilités
 */

/**
 * Middleware pour convertir et normaliser les types de données des rendez-vous
 * Utilisé dans rendezvous.routes.js
 */
export const convertAppointmentTypes = (req, res, next) => {
  const data = req.body;

  // Convertir les IDs string en nombres
  if (data.patient_id) {
    data.patient_id = Number(data.patient_id);
  }
  if (data.medecin_id) {
    data.medecin_id = Number(data.medecin_id);
  }
  if (data.duree) {
    data.duree = Number(data.duree);
  }

  // Normaliser les formats d'heure si présents
  if (data.heure) {
    data.heure = normalizeTimeFormat(data.heure);
  }
  if (data.heure_debut) {
    data.heure_debut = normalizeTimeFormat(data.heure_debut);
  }
  if (data.heure_fin) {
    data.heure_fin = normalizeTimeFormat(data.heure_fin);
  }

  // Validation basique des types convertis
  if (data.patient_id && (isNaN(data.patient_id) || data.patient_id <= 0)) {
    return res.status(400).json({
      message: "L'ID du patient doit être un nombre entier positif",
      field: "patient_id",
    });
  }

  if (data.medecin_id && (isNaN(data.medecin_id) || data.medecin_id <= 0)) {
    return res.status(400).json({
      message: "L'ID du médecin doit être un nombre entier positif",
      field: "medecin_id",
    });
  }

  if (data.duree && (isNaN(data.duree) || data.duree <= 0)) {
    return res.status(400).json({
      message: "La durée doit être un nombre positif",
      field: "duree",
    });
  }

  next();
};

// Validation des jours de la semaine
const joursValides = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

/**
 * Valide le format d'une heure (HH:MM ou HH:MM:SS)
 * @param {string} heure - L'heure à valider
 * @returns {boolean} - True si l'heure est valide
 */
const isValidTimeFormat = (heure) => {
  if (!heure || typeof heure !== "string") return false;

  // Regex pour HH:MM ou HH:MM:SS
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;

  if (!timeRegex.test(heure)) return false;

  // Vérifier que les heures et minutes sont dans les bonnes plages
  const parts = heure.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

/**
 * Convertit une heure en format HH:MM:SS si nécessaire
 * @param {string} heure - L'heure à normaliser
 * @returns {string} - L'heure au format HH:MM:SS
 */
const normalizeTimeFormat = (heure) => {
  if (!heure) return heure;

  // Si déjà au format HH:MM:SS, retourner tel quel
  if (heure.split(":").length === 3) return heure;

  // Sinon, ajouter :00 pour les secondes
  return `${heure}:00`;
};

/**
 * Middleware de validation pour la création/modification d'une disponibilité
 */
export const validateDisponibilite = (req, res, next) => {
  const { medecin_id, jour, heure_debut, heure_fin } = req.body;

  // Pour les modifications (PUT), medecin_id peut ne pas être dans le body
  // car il est géré par le middleware de propriété
  const isUpdate = req.method === "PUT";

  // Validation des champs requis
  if (!isUpdate && !medecin_id) {
    return res.status(400).json({
      message: "L'ID du médecin est requis",
      field: "medecin_id",
    });
  }

  if (!jour) {
    return res.status(400).json({
      message: "Le jour est requis",
      field: "jour",
    });
  }

  if (!heure_debut) {
    return res.status(400).json({
      message: "L'heure de début est requise",
      field: "heure_debut",
    });
  }

  if (!heure_fin) {
    return res.status(400).json({
      message: "L'heure de fin est requise",
      field: "heure_fin",
    });
  }

  // Validation du format des données
  if (
    !isUpdate &&
    (!Number.isInteger(Number(medecin_id)) || Number(medecin_id) <= 0)
  ) {
    return res.status(400).json({
      message: "L'ID du médecin doit être un nombre entier positif",
      field: "medecin_id",
    });
  }

  if (!joursValides.includes(jour.toLowerCase())) {
    return res.status(400).json({
      message: `Le jour doit être l'un des suivants : ${joursValides.join(
        ", "
      )}`,
      field: "jour",
      validValues: joursValides,
    });
  }

  if (!isValidTimeFormat(heure_debut)) {
    return res.status(400).json({
      message:
        "L'heure de début doit être au format HH:MM ou HH:MM:SS (ex: 09:00 ou 09:00:00)",
      field: "heure_debut",
    });
  }

  if (!isValidTimeFormat(heure_fin)) {
    return res.status(400).json({
      message:
        "L'heure de fin doit être au format HH:MM ou HH:MM:SS (ex: 17:00 ou 17:00:00)",
      field: "heure_fin",
    });
  }

  // Normaliser les formats d'heure
  req.body.jour = jour.toLowerCase();
  req.body.heure_debut = normalizeTimeFormat(heure_debut);
  req.body.heure_fin = normalizeTimeFormat(heure_fin);

  // Normaliser medecin_id seulement pour les créations
  if (!isUpdate && medecin_id) {
    req.body.medecin_id = Number(medecin_id);
  }

  // Validation logique des heures
  const [debutHours, debutMinutes] = req.body.heure_debut
    .split(":")
    .map(Number);
  const [finHours, finMinutes] = req.body.heure_fin.split(":").map(Number);

  const debutTotalMinutes = debutHours * 60 + debutMinutes;
  const finTotalMinutes = finHours * 60 + finMinutes;

  if (finTotalMinutes <= debutTotalMinutes) {
    return res.status(400).json({
      message: "L'heure de fin doit être postérieure à l'heure de début",
      field: "heure_fin",
    });
  }

  // Validation de la durée minimale (ex: au moins 30 minutes)
  const dureeMinutes = finTotalMinutes - debutTotalMinutes;
  if (dureeMinutes < 30) {
    return res.status(400).json({
      message: "La durée de la disponibilité doit être d'au moins 30 minutes",
      field: "duree",
    });
  }

  // Validation de la durée maximale (10 heures max pour éviter les plages irréalistes)
  if (dureeMinutes > 600) {
    // 10 heures = 600 minutes
    return res.status(400).json({
      message:
        "Une plage de disponibilité ne peut pas excéder 10 heures consécutives",
      field: "duree",
      maxDuration: "10 heures",
    });
  }

  // Validation des heures de travail raisonnables (6h00 à 22h00)
  if (debutHours < 6 || debutHours > 22 || finHours < 6 || finHours > 22) {
    return res.status(400).json({
      message:
        "Les heures de disponibilité doivent être comprises entre 06:00 et 22:00",
      field: "horaires",
    });
  }

  next();
};

/**
 * Middleware de validation pour les paramètres de requête des créneaux
 */
export const validateCreneauxParams = (req, res, next) => {
  const { medecinId } = req.params;
  const { date } = req.query;

  if (!medecinId) {
    return res.status(400).json({
      message: "L'ID du médecin est requis",
      field: "medecinId",
    });
  }

  if (!Number.isInteger(Number(medecinId)) || Number(medecinId) <= 0) {
    return res.status(400).json({
      message: "L'ID du médecin doit être un nombre entier positif",
      field: "medecinId",
    });
  }

  // La date est optionnelle pour les créneaux
  if (date) {
    // Validation du format de la date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        message: "La date doit être au format YYYY-MM-DD (ex: 2024-01-15)",
        field: "date",
      });
    }

    // Vérifier que la date est valide
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        message: "La date fournie n'est pas valide",
        field: "date",
      });
    }

    // Vérifier que la date n'est pas dans le passé (optionnel)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(400).json({
        message: "La date ne peut pas être dans le passé",
        field: "date",
      });
    }
  }

  next();
};

/**
 * Middleware de validation pour les paramètres d'ID
 */
export const validateDisponibiliteId = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "L'ID de la disponibilité est requis",
      field: "id",
    });
  }

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      message: "L'ID de la disponibilité doit être un nombre entier positif",
      field: "id",
    });
  }

  next();
};

/**
 * Middleware de validation pour les paramètres de médecin
 */
export const validateMedecinId = (req, res, next) => {
  const { medecinId } = req.params;

  if (!medecinId) {
    return res.status(400).json({
      message: "L'ID du médecin est requis",
      field: "medecinId",
    });
  }

  if (!Number.isInteger(Number(medecinId)) || Number(medecinId) <= 0) {
    return res.status(400).json({
      message: "L'ID du médecin doit être un nombre entier positif",
      field: "medecinId",
    });
  }

  next();
};
