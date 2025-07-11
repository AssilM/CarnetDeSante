// Fonctions utilitaires pour les dates

export const formatDateYMD = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateFr = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  try {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("fr-FR", options).format(date);
  } catch (error) {
    console.error("Erreur formatage date:", error);
    return date.toLocaleDateString("fr-FR");
  }
};

export const formatDateTimeFr = (dateStr, timeStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let time = timeStr ? timeStr.substring(0, 5) : "";
    return `${day}/${month}/${year}${time ? " à " + time : ""}`;
  } catch (error) {
    console.error("Erreur formatage date/heure:", error);
    return dateStr || "";
  }
};

export const getWeekDates = (date) => {
  const week = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    week.push(weekDate);
  }
  return week;
};

export const getMonthDates = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Premier jour du mois
  const firstDay = new Date(year, month, 1);

  // Premier jour à afficher (début de semaine)
  const startDate = new Date(firstDay);
  const startDayOfWeek = firstDay.getDay();
  const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  startDate.setDate(firstDay.getDate() - daysToSubtract);

  // Générer 42 jours (6 semaines)
  const dates = [];
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    dates.push(currentDate);
  }

  return dates;
};
