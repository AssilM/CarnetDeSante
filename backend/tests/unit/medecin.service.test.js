import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock des modules d'abord
vi.mock("../../src/config/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock("../../src/doctor/medecin.repository.js", () => ({
  findAllMedecins: vi.fn(),
  findMedecinByUserId: vi.fn(),
  existsMedecin: vi.fn(),
  createMedecin: vi.fn(),
  updateMedecin: vi.fn(),
}));

// Importer le service après les mocks
import {
  getAllMedecinsService,
  getMedecinByIdService,
  getProfileService,
  createOrUpdateProfileService,
  searchMedecinsService,
  getMedecinsBySpecialiteService,
  getAllSpecialitesService,
} from "../../src/doctor/medecin.service.js";

import pool from "../../src/config/db.js";
import {
  findAllMedecins,
  findMedecinByUserId,
  existsMedecin,
  createMedecin,
  updateMedecin,
} from "../../src/doctor/medecin.repository.js";

describe("medecin.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllMedecinsService", () => {
    it("récupère tous les médecins", async () => {
      // Arrange
      const mockMedecins = [
        { id: 1, nom: "Dr Dupont", specialite: "Cardiologie" },
        { id: 2, nom: "Dr Martin", specialite: "Dermatologie" },
      ];
      findAllMedecins.mockResolvedValue(mockMedecins);

      // Act
      const result = await getAllMedecinsService();

      // Assert
      expect(result).toEqual(mockMedecins);
      expect(findAllMedecins).toHaveBeenCalledOnce();
    });
  });

  describe("getMedecinByIdService", () => {
    it("récupère un médecin par son ID utilisateur", async () => {
      // Arrange
      const userId = 1;
      const mockMedecin = {
        utilisateur_id: userId,
        nom: "Dupont",
        prenom: "Jean",
        email: "jean.dupont@test.com",
        specialite: "Cardiologie",
        description: "Cardiologue expérimenté",
      };

      pool.query.mockResolvedValue({
        rows: [mockMedecin],
      });

      // Act
      const result = await getMedecinByIdService(userId);

      // Assert
      expect(result).toEqual(mockMedecin);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT m.utilisateur_id"),
        [userId]
      );
    });

    it("retourne null si le médecin n'existe pas", async () => {
      // Arrange
      const userId = 999;
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      const result = await getMedecinByIdService(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getProfileService", () => {
    it("récupère le profil d'un médecin", async () => {
      // Arrange
      const userId = 1;
      const mockProfile = {
        utilisateur_id: userId,
        specialite: "Cardiologie",
        description: "Spécialiste du cœur",
      };

      findMedecinByUserId.mockResolvedValue(mockProfile);

      // Act
      const result = await getProfileService(userId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(findMedecinByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe("createOrUpdateProfileService", () => {
    it("crée un nouveau profil médecin", async () => {
      // Arrange
      const profileData = {
        utilisateur_id: 1,
        specialite: "Cardiologie",
        description: "Expert en maladies cardiovasculaires",
      };
      const requesterId = 1; // Même utilisateur
      const requesterRole = "medecin";
      const mockCreatedProfile = { id: 1, ...profileData };

      existsMedecin.mockResolvedValue(false);
      createMedecin.mockResolvedValue(mockCreatedProfile);
      findMedecinByUserId.mockResolvedValue(mockCreatedProfile);

      // Act
      const result = await createOrUpdateProfileService(
        profileData,
        requesterId,
        requesterRole
      );

      // Assert
      expect(result).toEqual(mockCreatedProfile);
      expect(existsMedecin).toHaveBeenCalledWith(profileData.utilisateur_id);
      expect(createMedecin).toHaveBeenCalledWith(
        profileData.utilisateur_id,
        profileData.specialite,
        profileData.description
      );
    });

    it("met à jour un profil médecin existant", async () => {
      // Arrange
      const profileData = {
        utilisateur_id: 1,
        specialite: "Neurologie",
        description: "Spécialiste du système nerveux",
      };
      const requesterId = 1; // Même utilisateur
      const requesterRole = "medecin";
      const mockUpdatedProfile = { id: 1, ...profileData };

      existsMedecin.mockResolvedValue(true);
      updateMedecin.mockResolvedValue(mockUpdatedProfile);
      findMedecinByUserId.mockResolvedValue(mockUpdatedProfile);

      // Act
      const result = await createOrUpdateProfileService(
        profileData,
        requesterId,
        requesterRole
      );

      // Assert
      expect(result).toEqual(mockUpdatedProfile);
      expect(existsMedecin).toHaveBeenCalledWith(profileData.utilisateur_id);
      expect(updateMedecin).toHaveBeenCalledWith(
        profileData.utilisateur_id,
        profileData.specialite,
        profileData.description
      );
    });
  });

  describe("searchMedecinsService", () => {
    it("recherche des médecins par terme de recherche", async () => {
      // Arrange
      const searchTerm = "cardio";
      const mockResults = [
        { nom: "Dr Dupont", specialite: "Cardiologie" },
        { nom: "Dr Martin", specialite: "Cardiologie interventionnelle" },
      ];

      pool.query.mockResolvedValue({ rows: mockResults });

      // Act
      const result = await searchMedecinsService(searchTerm);

      // Assert
      expect(result).toEqual(mockResults);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE"),
        ["%cardio%"]
      );
    });

    it("retourne une liste vide si aucun résultat", async () => {
      // Arrange
      const searchTerm = "inexistant";
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      const result = await searchMedecinsService(searchTerm);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getMedecinsBySpecialiteService", () => {
    it("récupère les médecins par spécialité", async () => {
      // Arrange
      const specialite = "Cardiologie";
      const mockMedecins = [
        { nom: "Dr Dupont", specialite: "Cardiologie" },
        { nom: "Dr Durand", specialite: "Cardiologie" },
      ];

      pool.query.mockResolvedValue({ rows: mockMedecins });

      // Act
      const result = await getMedecinsBySpecialiteService(specialite);

      // Assert
      expect(result).toEqual({ medecins: mockMedecins });
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE LOWER(m.specialite)"),
        [specialite]
      );
    });
  });

  describe("getAllSpecialitesService", () => {
    it("récupère toutes les spécialités médicales", async () => {
      // Arrange
      const mockSpecialiteRows = [
        { specialite: "Cardiologie" },
        { specialite: "Dermatologie" },
        { specialite: "Neurologie" },
      ];

      pool.query.mockResolvedValue({ rows: mockSpecialiteRows });

      // Act
      const result = await getAllSpecialitesService();

      // Assert
      expect(result).toEqual(["Cardiologie", "Dermatologie", "Neurologie"]);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT DISTINCT specialite FROM medecin ORDER BY specialite"
      );
    });
  });
});
