import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatDateYMD,
  formatDateFr,
  formatDateTimeFr,
  getWeekDates,
  getMonthDates,
} from "./date.utils.js";

describe("date.utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatDateYMD", () => {
    it("formate une date en YYYY-MM-DD", () => {
      const date = new Date("2024-03-15");
      const result = formatDateYMD(date);
      expect(result).toBe("2024-03-15");
    });

    it("formate correctement les mois et jours avec un chiffre", () => {
      const date = new Date("2024-01-05");
      const result = formatDateYMD(date);
      expect(result).toBe("2024-01-05");
    });

    it("retourne une chaîne vide pour une date invalide", () => {
      const invalidDate = new Date("invalid");
      const result = formatDateYMD(invalidDate);
      expect(result).toBe("");
    });

    it("retourne une chaîne vide pour un paramètre non-Date", () => {
      const result = formatDateYMD("not a date");
      expect(result).toBe("");
    });

    it("retourne une chaîne vide pour null", () => {
      const result = formatDateYMD(null);
      expect(result).toBe("");
    });
  });

  describe("formatDateFr", () => {
    it("formate une date en français", () => {
      const date = new Date("2024-03-15");
      const result = formatDateFr(date);
      // Le format exact peut varier selon l'environnement, on vérifie juste que c'est une chaîne non-vide
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("gère les dates invalides", () => {
      const invalidDate = new Date("invalid");
      const result = formatDateFr(invalidDate);
      expect(result).toBe("");
    });

    it("gère les erreurs de formatage", () => {
      // Mock console.error pour éviter les logs pendant les tests
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = formatDateFr("not a date");
      expect(result).toBe("");

      consoleSpy.mockRestore();
    });
  });

  describe("formatDateTimeFr", () => {
    it("formate une date avec heure en format français", () => {
      const result = formatDateTimeFr("2024-03-15", "14:30:00");
      expect(result).toBe("15/03/2024 à 14:30");
    });

    it("formate une date sans heure", () => {
      const result = formatDateTimeFr("2024-03-15");
      expect(result).toBe("15/03/2024");
    });

    it("formate une date avec heure null", () => {
      const result = formatDateTimeFr("2024-03-15", null);
      expect(result).toBe("15/03/2024");
    });

    it("retourne une chaîne vide pour une date null", () => {
      const result = formatDateTimeFr(null);
      expect(result).toBe("");
    });

    it("gère les dates invalides", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = formatDateTimeFr("invalid-date");
      expect(result).toBe("");

      consoleSpy.mockRestore();
    });

    it("tronque les heures aux 5 premiers caractères", () => {
      const result = formatDateTimeFr("2024-03-15", "14:30:45.123");
      expect(result).toBe("15/03/2024 à 14:30");
    });
  });

  describe("getWeekDates", () => {
    it("retourne 7 dates pour une semaine", () => {
      const date = new Date("2024-03-15"); // Vendredi
      const week = getWeekDates(date);

      expect(week).toHaveLength(7);
      expect(week[0]).toBeInstanceOf(Date);
    });

    it("commence toujours par un lundi", () => {
      const friday = new Date("2024-03-15"); // Vendredi 15 mars 2024
      const week = getWeekDates(friday);

      // Le lundi de cette semaine est le 11 mars
      expect(week[0].getDay()).toBe(1); // 1 = lundi
      expect(week[0].getDate()).toBe(11);
    });

    it("gère correctement un dimanche", () => {
      const sunday = new Date("2024-03-17"); // Dimanche 17 mars 2024
      const week = getWeekDates(sunday);

      // Doit commencer par le lundi 11 mars
      expect(week[0].getDay()).toBe(1); // lundi
      expect(week[0].getDate()).toBe(11);
      expect(week[6].getDay()).toBe(0); // dimanche
      expect(week[6].getDate()).toBe(17);
    });
  });

  describe("getMonthDates", () => {
    it("retourne 42 dates (6 semaines)", () => {
      const date = new Date("2024-03-01");
      const monthDates = getMonthDates(date);

      expect(monthDates).toHaveLength(42);
      expect(monthDates[0]).toBeInstanceOf(Date);
    });

    it("commence par un lundi", () => {
      const date = new Date("2024-03-01"); // Mars 2024 commence un vendredi
      const monthDates = getMonthDates(date);

      // Le premier jour affiché doit être un lundi
      expect(monthDates[0].getDay()).toBe(1); // 1 = lundi
    });

    it("inclut des jours du mois précédent et suivant", () => {
      const date = new Date("2024-03-01"); // Mars 2024
      const monthDates = getMonthDates(date);

      // Devrait inclure des jours de février et avril
      const firstDate = monthDates[0];
      const lastDate = monthDates[41];

      // Le premier jour devrait être en février (mois 1)
      expect(firstDate.getMonth()).toBe(1); // février = 1

      // Le dernier jour pourrait être en avril (mois 3)
      expect(lastDate.getMonth()).toBeGreaterThanOrEqual(2); // mars = 2
    });

    it("génère des dates consécutives", () => {
      const date = new Date("2024-03-01");
      const monthDates = getMonthDates(date);

      // Vérifier que chaque date est le jour suivant de la précédente
      for (let i = 1; i < monthDates.length; i++) {
        const prevDate = monthDates[i - 1];
        const currentDate = monthDates[i];
        const diffInMs = currentDate.getTime() - prevDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        expect(diffInDays).toBe(1);
      }
    });
  });
});
