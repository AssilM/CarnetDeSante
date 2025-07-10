/**
 * Récupère le jour de la semaine en français pour une date donnée
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {string} - Jour de la semaine en français
 */
export const getJourSemaine = (dateStr) => {
  const date = new Date(dateStr + "T00:00:00Z"); // Force UTC pour éviter les décalages
  const jours = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];
  return jours[date.getUTCDay()];
};

/**
 * Vérifie si une date est dans le futur (pas aujourd'hui ni passée)
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {boolean}
 */
export const isDateInFuture = (dateStr) => {
  const today = new Date().toISOString().split("T")[0];
  return dateStr > today;
};

/**
 * Vérifie si une date est aujourd'hui ou dans le futur
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {boolean}
 */
export const isDateTodayOrFuture = (dateStr) => {
  const today = new Date().toISOString().split("T")[0];
  return dateStr >= today;
};

/**
 * Formate une heure en string HH:MM
 * @param {Date|string} time - Heure à formater
 * @returns {string} - Heure au format HH:MM
 */
export const formatTime = (time) => {
  if (typeof time === "string") return time;
  return time.toTimeString().slice(0, 5);
};

/**
 * Vérifie si deux créneaux horaires se chevauchent
 * @param {string} start1 - Heure de début du premier créneau (HH:MM)
 * @param {number} duration1 - Durée du premier créneau en minutes
 * @param {string} start2 - Heure de début du second créneau (HH:MM)
 * @param {number} duration2 - Durée du second créneau en minutes
 * @returns {boolean}
 */
export const timeSlotsOverlap = (start1, duration1, start2, duration2) => {
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = start2.split(":").map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = start1Minutes + duration1;
  const start2Minutes = h2 * 60 + m2;
  const end2Minutes = start2Minutes + duration2;

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Convertir une heure au format HH:MM:SS en minutes depuis minuit
 * @param {string} timeStr - Heure au format HH:MM:SS ou HH:MM
 * @returns {number} - Minutes depuis minuit
 */
export const convertTimeToMinutes = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Convertir des minutes en format HH:MM:SS
 * @param {number} minutes - Minutes depuis minuit
 * @returns {string} - Heure au format HH:MM:SS
 */
export const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
};

/**
 * Formate une date en français (ex: "lundi 15 janvier 2024")
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {string} - Date formatée en français
 */
export const formatDateToFrench = (dateStr) => {
  const date = new Date(dateStr + "T00:00:00Z");
  const jours = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];
  const mois = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const jour = jours[date.getUTCDay()];
  const numeroJour = date.getUTCDate();
  const nomMois = mois[date.getUTCMonth()];
  const annee = date.getUTCFullYear();

  return `${jour} ${numeroJour} ${nomMois} ${annee}`;
};

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param {string} dateNaissance - Date de naissance au format YYYY-MM-DD
 * @returns {number} - Âge en années
 */
export const calculateAge = (dateNaissance) => {
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Génère une plage de dates entre deux dates
 * @param {string} startDate - Date de début au format YYYY-MM-DD
 * @param {string} endDate - Date de fin au format YYYY-MM-DD
 * @returns {Array<string>} - Tableau de dates au format YYYY-MM-DD
 */
export const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
