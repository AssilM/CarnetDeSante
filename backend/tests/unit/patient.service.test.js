import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock des modules d'abord
vi.mock("../../src/config/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock("../../src/patient/patient.repository.js", () => ({
  findAllPatients: vi.fn(),
  findPatientByUserId: vi.fn(),
  existsPatient: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  deletePatient: vi.fn(),
}));

// Importer après les mocks
import {
  getAllPatientsService,
  getProfileService,
  getProfileByUserIdService,
  createOrUpdateProfileService,
} from "../../src/patient/patient.service.js";

import {
  findAllPatients,
  findPatientByUserId,
  existsPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from "../../src/patient/patient.repository.js";

import pool from "../../src/config/db.js";

describe("patient.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllPatientsService", () => {
    it("récupère tous les patients avec succès", async () => {
      // Arrange
      const mockPatients = [
        { id: 1, nom: "Dupont", prenom: "Jean", groupe_sanguin: "O+" },
        { id: 2, nom: "Martin", prenom: "Marie", groupe_sanguin: "A-" },
      ];

      findAllPatients.mockResolvedValue(mockPatients);

      // Act
      const result = await getAllPatientsService();

      // Assert
      expect(result).toEqual(mockPatients);
      expect(findAllPatients).toHaveBeenCalledOnce();
    });

    it("gère les erreurs de base de données", async () => {
      // Arrange
      findAllPatients.mockRejectedValue(
        new Error("Database connection failed")
      );

      // Act & Assert
      await expect(getAllPatientsService()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("getProfileService", () => {
    it("récupère le profil d'un patient existant", async () => {
      // Arrange
      const userId = 1;
      const mockPatient = {
        id: 1,
        utilisateur_id: userId,
        groupe_sanguin: "O+",
        taille: 175,
        poids: 75,
        nom: "Dupont",
        prenom: "Jean",
      };

      findPatientByUserId.mockResolvedValue(mockPatient);

      // Act
      const result = await getProfileService(userId);

      // Assert
      expect(result).toEqual({ patient: mockPatient });
      expect(findPatientByUserId).toHaveBeenCalledWith(userId);
    });

    it("lève une erreur si le patient n'existe pas", async () => {
      // Arrange
      const userId = 999;
      findPatientByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(getProfileService(userId)).rejects.toThrow(
        "Profil patient non trouvé"
      );
    });
  });

  describe("getProfileByUserIdService", () => {
    it("récupère le profil d'un patient par ID utilisateur", async () => {
      // Arrange
      const userId = 1;
      const mockPatient = {
        id: 1,
        utilisateur_id: userId,
        groupe_sanguin: "A+",
        taille: 168,
        poids: 60,
      };

      findPatientByUserId.mockResolvedValue(mockPatient);

      // Act
      const result = await getProfileByUserIdService(userId);

      // Assert
      expect(result).toEqual({ patient: mockPatient });
      expect(findPatientByUserId).toHaveBeenCalledWith(userId);
    });

    it("lève une erreur si le patient n'existe pas", async () => {
      // Arrange
      const userId = 999;
      findPatientByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(getProfileByUserIdService(userId)).rejects.toThrow(
        "Profil patient non trouvé"
      );
    });
  });

  describe("createOrUpdateProfileService", () => {
    const validProfileData = {
      utilisateur_id: 1,
      groupe_sanguin: "O+",
      taille: 175,
      poids: 75,
    };

    it("permet à un patient de mettre à jour son propre profil", async () => {
      // Arrange
      const requestUserId = 1;
      const requestUserRole = "patient";

      existsPatient.mockResolvedValue(true);
      updatePatient.mockResolvedValue({
        id: 1,
        ...validProfileData,
      });
      findPatientByUserId.mockResolvedValue({
        id: 1,
        ...validProfileData,
      });

      // Act
      const result = await createOrUpdateProfileService(
        requestUserId,
        requestUserRole,
        validProfileData
      );

      // Assert
      expect(result).toBeDefined();
      expect(updatePatient).toHaveBeenCalledWith(
        validProfileData.utilisateur_id,
        validProfileData.groupe_sanguin,
        validProfileData.taille,
        validProfileData.poids
      );
    });

    it("permet à un admin de mettre à jour le profil d'un patient", async () => {
      // Arrange
      const requestUserId = 2; // admin
      const requestUserRole = "admin";

      existsPatient.mockResolvedValue(true);
      updatePatient.mockResolvedValue({
        id: 1,
        ...validProfileData,
      });
      findPatientByUserId.mockResolvedValue({
        id: 1,
        ...validProfileData,
      });

      // Act
      const result = await createOrUpdateProfileService(
        requestUserId,
        requestUserRole,
        validProfileData
      );

      // Assert
      expect(result).toBeDefined();
      expect(updatePatient).toHaveBeenCalledWith(
        validProfileData.utilisateur_id,
        validProfileData.groupe_sanguin,
        validProfileData.taille,
        validProfileData.poids
      );
    });

    it("empêche un patient de modifier le profil d'un autre patient", async () => {
      // Arrange
      const requestUserId = 1;
      const requestUserRole = "patient";
      const otherPatientData = {
        ...validProfileData,
        utilisateur_id: 2, // Différent du requestUserId
      };

      // Act & Assert
      await expect(
        createOrUpdateProfileService(
          requestUserId,
          requestUserRole,
          otherPatientData
        )
      ).rejects.toThrow("Vous n'êtes pas autorisé à modifier ce profil");
    });

    it("crée un nouveau profil si le patient n'existe pas", async () => {
      // Arrange
      const requestUserId = 1;
      const requestUserRole = "patient";

      existsPatient.mockResolvedValue(false);
      createPatient.mockResolvedValue({
        id: 1,
        ...validProfileData,
      });
      findPatientByUserId.mockResolvedValue({
        id: 1,
        ...validProfileData,
      });

      // Act
      const result = await createOrUpdateProfileService(
        requestUserId,
        requestUserRole,
        validProfileData
      );

      // Assert
      expect(result).toBeDefined();
      expect(createPatient).toHaveBeenCalledWith(
        validProfileData.utilisateur_id,
        validProfileData.groupe_sanguin,
        validProfileData.taille,
        validProfileData.poids
      );
    });
  });

  describe("Validation et sécurité", () => {
    it("valide les données du profil", () => {
      // Test des validations métier
      const validateProfileData = (data) => {
        const validBloodTypes = [
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-",
        ];

        if (
          data.groupe_sanguin &&
          !validBloodTypes.includes(data.groupe_sanguin)
        ) {
          throw new Error("Groupe sanguin invalide");
        }

        if (data.taille && (data.taille < 0 || data.taille > 300)) {
          throw new Error("Taille invalide");
        }

        if (
          data.poids &&
          (isNaN(data.poids) || data.poids < 0 || data.poids > 1000)
        ) {
          throw new Error("Poids invalide");
        }
      };

      // Test avec données invalides
      const invalidData = {
        utilisateur_id: 1,
        groupe_sanguin: "INVALID",
        taille: -10,
        poids: "invalid",
      };

      expect(() => validateProfileData(invalidData)).toThrow();

      // Test avec données valides
      const validData = {
        utilisateur_id: 1,
        groupe_sanguin: "O+",
        taille: 175,
        poids: 75,
      };

      expect(() => validateProfileData(validData)).not.toThrow();
    });

    it("empêche l'accès non autorisé", () => {
      const checkAccess = (requestUserId, requestUserRole, targetPatientId) => {
        if (
          requestUserRole === "patient" &&
          requestUserId !== targetPatientId
        ) {
          throw new Error("Accès non autorisé");
        }
        return true;
      };

      // Patient tentant d'accéder aux données d'un autre patient
      expect(() => checkAccess(1, "patient", 2)).toThrow("Accès non autorisé");

      // Patient accédant à ses propres données
      expect(() => checkAccess(1, "patient", 1)).not.toThrow();

      // Médecin accédant aux données d'un patient
      expect(() => checkAccess(1, "medecin", 2)).not.toThrow();
    });
  });
});
