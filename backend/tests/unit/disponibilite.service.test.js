import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock des modules d'abord
vi.mock("../../src/availability/disponibilite.repository.js", () => ({
  findDisponibilitesByMedecinId: vi.fn(),
  checkMedecinExists: vi.fn(),
  checkDisponibiliteOverlap: vi.fn(),
  createDisponibilite: vi.fn(),
  findDisponibiliteById: vi.fn(),
  updateDisponibilite: vi.fn(),
  deleteDisponibilite: vi.fn(),
  findDisponibilitesByJour: vi.fn(),
}));

vi.mock("../../src/utils/date.utils.js", () => ({
  getJourSemaine: vi.fn(() => "mercredi"),
  convertTimeToMinutes: vi.fn(),
  formatMinutesToTime: vi.fn(),
}));

vi.mock("../../src/appointment/rendezvous.repository.js", () => ({
  findAppointmentsByMedecinAndDate: vi.fn(),
}));

// Importer le service après les mocks
import {
  getDisponibilitesByMedecinService,
  createDisponibiliteService,
  updateDisponibiliteService,
  deleteDisponibiliteService,
  getCreneauxDisponiblesService,
} from "../../src/availability/disponibilite.service.js";

import {
  findDisponibilitesByMedecinId,
  checkMedecinExists,
  checkDisponibiliteOverlap,
  createDisponibilite,
  findDisponibiliteById,
  updateDisponibilite,
  deleteDisponibilite,
  findDisponibilitesByJour,
} from "../../src/availability/disponibilite.repository.js";

import { findAppointmentsByMedecinAndDate } from "../../src/appointment/rendezvous.repository.js";
import {
  convertTimeToMinutes,
  formatMinutesToTime,
} from "../../src/utils/date.utils.js";

describe("disponibilite.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDisponibilitesByMedecinService", () => {
    it("récupère les disponibilités d'un médecin", async () => {
      // Arrange
      const medecinId = 1;
      const mockDisponibilites = [
        {
          id: 1,
          medecin_id: 1,
          jour: "lundi",
          heure_debut: "09:00",
          heure_fin: "17:00",
        },
        {
          id: 2,
          medecin_id: 1,
          jour: "mardi",
          heure_debut: "09:00",
          heure_fin: "17:00",
        },
      ];

      findDisponibilitesByMedecinId.mockResolvedValue(mockDisponibilites);

      // Act
      const result = await getDisponibilitesByMedecinService(medecinId);

      // Assert
      expect(result).toEqual(mockDisponibilites);
      expect(findDisponibilitesByMedecinId).toHaveBeenCalledWith(medecinId);
    });
  });

  describe("createDisponibiliteService", () => {
    it("crée une nouvelle disponibilité avec succès", async () => {
      // Arrange
      const disponibiliteData = {
        medecin_id: 1,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };
      const auditInfo = { userId: 1, userRole: "medecin" };
      const mockCreatedDisponibilite = { id: 1, ...disponibiliteData };

      checkMedecinExists.mockResolvedValue(true);
      checkDisponibiliteOverlap.mockResolvedValue(false);
      createDisponibilite.mockResolvedValue(mockCreatedDisponibilite);

      // Act
      const result = await createDisponibiliteService(
        disponibiliteData,
        auditInfo
      );

      // Assert
      expect(result).toEqual(mockCreatedDisponibilite);
      expect(checkMedecinExists).toHaveBeenCalledWith(
        disponibiliteData.medecin_id
      );
      expect(checkDisponibiliteOverlap).toHaveBeenCalledWith(
        disponibiliteData.medecin_id,
        disponibiliteData.jour,
        disponibiliteData.heure_debut,
        disponibiliteData.heure_fin
      );
      expect(createDisponibilite).toHaveBeenCalledWith(
        disponibiliteData.medecin_id,
        disponibiliteData.jour,
        disponibiliteData.heure_debut,
        disponibiliteData.heure_fin
      );
    });

    it("rejette si le médecin n'existe pas", async () => {
      // Arrange
      const disponibiliteData = {
        medecin_id: 999,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };
      const auditInfo = { userId: 1, userRole: "medecin" };

      checkMedecinExists.mockResolvedValue(false);

      // Act & Assert
      await expect(
        createDisponibiliteService(disponibiliteData, auditInfo)
      ).rejects.toThrow("Médecin non trouvé");

      expect(checkMedecinExists).toHaveBeenCalledWith(
        disponibiliteData.medecin_id
      );
      expect(checkDisponibiliteOverlap).not.toHaveBeenCalled();
    });

    it("rejette s'il y a un conflit d'horaire", async () => {
      // Arrange
      const disponibiliteData = {
        medecin_id: 1,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };
      const auditInfo = { userId: 1, userRole: "medecin" };

      checkMedecinExists.mockResolvedValue(true);
      checkDisponibiliteOverlap.mockResolvedValue(true);

      // Act & Assert
      await expect(
        createDisponibiliteService(disponibiliteData, auditInfo)
      ).rejects.toThrow(
        "Une disponibilité existe déjà pour ce médecin à ce jour et créneau horaire"
      );

      expect(checkDisponibiliteOverlap).toHaveBeenCalledWith(
        disponibiliteData.medecin_id,
        disponibiliteData.jour,
        disponibiliteData.heure_debut,
        disponibiliteData.heure_fin
      );
      expect(createDisponibilite).not.toHaveBeenCalled();
    });
  });

  describe("updateDisponibiliteService", () => {
    it("met à jour une disponibilité avec succès", async () => {
      // Arrange
      const id = 1;
      const updateData = {
        jour: "mardi",
        heure_debut: "10:00",
        heure_fin: "18:00",
      };
      const auditInfo = { userId: 1, userRole: "medecin" };
      const mockExistingDisponibilite = {
        id: 1,
        medecin_id: 1,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };
      const mockUpdatedDisponibilite = {
        ...mockExistingDisponibilite,
        ...updateData,
      };

      findDisponibiliteById.mockResolvedValue(mockExistingDisponibilite);
      checkDisponibiliteOverlap.mockResolvedValue(false);
      updateDisponibilite.mockResolvedValue(mockUpdatedDisponibilite);

      // Act
      const result = await updateDisponibiliteService(
        id,
        updateData,
        auditInfo
      );

      // Assert
      expect(result).toEqual(mockUpdatedDisponibilite);
      expect(findDisponibiliteById).toHaveBeenCalledWith(id);
      expect(updateDisponibilite).toHaveBeenCalledWith(
        id,
        updateData.jour,
        updateData.heure_debut,
        updateData.heure_fin
      );
    });

    it("rejette si la disponibilité n'existe pas", async () => {
      // Arrange
      const id = 999;
      const updateData = { jour: "mardi" };
      const auditInfo = { userId: 1, userRole: "medecin" };

      findDisponibiliteById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateDisponibiliteService(id, updateData, auditInfo)
      ).rejects.toThrow("Disponibilité non trouvée");

      expect(findDisponibiliteById).toHaveBeenCalledWith(id);
      expect(updateDisponibilite).not.toHaveBeenCalled();
    });
  });

  describe("deleteDisponibiliteService", () => {
    it("supprime une disponibilité avec succès", async () => {
      // Arrange
      const id = 1;
      const auditInfo = { userId: 1, userRole: "medecin" };
      const mockDisponibilite = {
        id: 1,
        medecin_id: 1,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };

      findDisponibiliteById.mockResolvedValue(mockDisponibilite);
      deleteDisponibilite.mockResolvedValue(true);

      // Act
      const result = await deleteDisponibiliteService(id, auditInfo);

      // Assert
      expect(result).toBe(true);
      expect(findDisponibiliteById).toHaveBeenCalledWith(id);
      expect(deleteDisponibilite).toHaveBeenCalledWith(id);
    });

    it("rejette si la disponibilité n'existe pas", async () => {
      // Arrange
      const id = 999;
      const auditInfo = { userId: 1, userRole: "medecin" };

      findDisponibiliteById.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteDisponibiliteService(id, auditInfo)).rejects.toThrow(
        "Disponibilité non trouvée"
      );

      expect(findDisponibiliteById).toHaveBeenCalledWith(id);
      expect(deleteDisponibilite).not.toHaveBeenCalled();
    });
  });

  describe("getCreneauxDisponiblesService", () => {
    it("calcule les créneaux disponibles pour un médecin", async () => {
      // Arrange
      const medecinId = 1;
      const date = "2024-12-25";
      const mockDisponibilites = [{ heure_debut: "09:00", heure_fin: "17:00" }];
      const mockRendezVous = [
        { heure: "10:00", duree: 30 },
        { heure: "15:00", duree: 60 },
      ];
      const mockCreneaux = [
        { heure: "09:00", disponible: true },
        { heure: "09:30", disponible: true },
        { heure: "10:00", disponible: false },
        { heure: "10:30", disponible: true },
      ];

      findDisponibilitesByJour.mockResolvedValue(mockDisponibilites);
      findAppointmentsByMedecinAndDate.mockResolvedValue(mockRendezVous);
      convertTimeToMinutes.mockImplementation((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      });
      formatMinutesToTime.mockImplementation((minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}`;
      });

      // Act
      const result = await getCreneauxDisponiblesService(medecinId, date);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result.creneaux).toBeDefined();
      expect(Array.isArray(result.creneaux)).toBe(true);
      expect(findDisponibilitesByJour).toHaveBeenCalledWith(
        medecinId,
        "mercredi"
      );
      expect(findAppointmentsByMedecinAndDate).toHaveBeenCalledWith(
        medecinId,
        date
      );
    });

    it("retourne une liste vide si aucune disponibilité", async () => {
      // Arrange
      const medecinId = 1;
      const date = "2024-12-25";

      findDisponibilitesByJour.mockResolvedValue([]);

      // Act
      const result = await getCreneauxDisponiblesService(medecinId, date);

      // Assert
      expect(result).toEqual({
        date: "2024-12-25",
        jour: "mercredi",
        disponible: false,
        message: "Aucune disponibilité pour ce jour",
        disponibilites: [],
        creneaux: [],
      });
      expect(findDisponibilitesByJour).toHaveBeenCalledWith(
        medecinId,
        "mercredi"
      );
    });
  });
});
