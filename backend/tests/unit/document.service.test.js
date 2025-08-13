import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock des modules d'abord
vi.mock("../../src/document/document.repository.js", () => ({
  default: {
    // Méthodes qui existent vraiment dans le repository
    getAllDocumentTypes: vi.fn(),
    getTypeIdByCode: vi.fn(),
    getTypeIdByLabel: vi.fn(),
    createDocument: vi.fn(),
    getDocumentById: vi.fn(),
    getDocumentsByPatient: vi.fn(),
    getDocumentsByMedecin: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    createDocumentPermission: vi.fn(),
    getDocumentPermissions: vi.fn(),
    getUserDocuments: vi.fn(),
    deleteDocumentPermission: vi.fn(),
    getDocumentsSharedByPatientToDoctor: vi.fn(),
    getDocumentDoctorsWithAccess: vi.fn(),
    linkDocumentToRendezVous: vi.fn(),
    getDocumentsByRendezVous: vi.fn(),
    findPatientById: vi.fn(),
    getRendezVousById: vi.fn(),
  },
}));

vi.mock("../../src/acl/acl.repository.js", () => ({
  default: {
    shareDocumentWithDoctor: vi.fn(),
    getDocumentPermissions: vi.fn(),
  },
}));

vi.mock("../../src/appointment/rendezvous.repository.js", () => ({
  findRendezVousById: vi.fn(),
}));

// Importer le service après les mocks
import {
  createDocumentByPatientService,
  getDocumentsService,
  getDocumentByIdService,
  deleteDocumentService,
  shareDocumentByPatientService,
} from "../../src/document/document.service.js";

import documentRepository from "../../src/document/document.repository.js";
import aclRepository from "../../src/acl/acl.repository.js";
import { findRendezVousById } from "../../src/appointment/rendezvous.repository.js";

describe("document.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDocumentByPatientService", () => {
    const mockFile = {
      filename: "test.pdf",
      path: "/uploads/test.pdf",
      mimetype: "application/pdf",
      size: 1024,
    };

    it("crée un document avec succès pour un patient", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const documentData = {
        titre: "Mon analyse",
        type_document: "Analyse",
        description: "Analyse de sang",
        date_creation: "2024-01-01",
      };

      documentRepository.getTypeIdByLabel.mockResolvedValue(1);
      documentRepository.createDocument.mockResolvedValue({
        id: 123,
        titre: documentData.titre,
        patient_id: userId,
        uploader_id: userId,
      });

      // Act
      const result = await createDocumentByPatientService(
        userId,
        userRole,
        documentData,
        mockFile
      );

      // Assert
      expect(result).toEqual({
        id: 123,
        titre: documentData.titre,
        patient_id: userId,
        uploader_id: userId,
      });

      expect(documentRepository.createDocument).toHaveBeenCalledWith({
        titre: documentData.titre,
        description: documentData.description,
        date_creation: documentData.date_creation,
        patient_id: userId,
        medecin_id: null,
        uploader_id: userId,
        nom_fichier: mockFile.originalname,
        chemin_fichier: mockFile.path,
        type_mime: mockFile.mimetype,
        taille_fichier: mockFile.size,
        type_id: 1,
      });
    });

    it("permet de créer une vaccination sans fichier", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const documentData = {
        titre: "Vaccin COVID-19",
        type_document: "Vaccination",
        description: "Première dose",
      };

      documentRepository.getTypeIdByLabel.mockResolvedValue(3);
      documentRepository.createDocument.mockResolvedValue({
        id: 125,
        titre: documentData.titre,
        file_path: null,
      });

      // Act
      const result = await createDocumentByPatientService(
        userId,
        userRole,
        documentData,
        null
      );

      // Assert
      expect(result).toBeDefined();
      expect(documentRepository.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          nom_fichier: "Aucun document",
          chemin_fichier: null,
          type_mime: "none",
          taille_fichier: 0,
        })
      );
    });

    it("rejette si le titre est manquant", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const documentData = {
        type_document: "Analyse",
        description: "Test",
      };

      // Act & Assert
      await expect(
        createDocumentByPatientService(userId, userRole, documentData, mockFile)
      ).rejects.toThrow("Titre, type de document et fichier sont requis");
    });

    it("rejette si le fichier est manquant pour un document non-vaccination", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const documentData = {
        titre: "Test",
        type_document: "Analyse",
        description: "Test",
      };

      // Act & Assert
      await expect(
        createDocumentByPatientService(userId, userRole, documentData, null)
      ).rejects.toThrow("Titre, type de document et fichier sont requis");
    });
  });

  describe("getDocumentsService", () => {
    it("récupère les documents d'un utilisateur avec succès", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const mockDocuments = [
        {
          id: 1,
          titre: "Doc 1",
          patient_id: 1,
          type_document_label: "Analyse",
        },
        { id: 2, titre: "Doc 2", patient_id: 1, type_document_label: "Radio" },
      ];

      documentRepository.getUserDocuments.mockResolvedValue(mockDocuments);

      // Act
      const result = await getDocumentsService(userId, userRole);

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          titre: "Doc 1",
          patient_id: 1,
          type_document_label: "Analyse",
          type_document: "Analyse",
        },
        {
          id: 2,
          titre: "Doc 2",
          patient_id: 1,
          type_document_label: "Radio",
          type_document: "Radio",
        },
      ]);
      expect(documentRepository.getUserDocuments).toHaveBeenCalledWith(userId);
    });
  });

  describe("getDocumentByIdService", () => {
    it("récupère un document par ID avec succès", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const documentId = 1;
      const mockDocument = {
        id: documentId,
        titre: "Mon document",
        patient_id: userId,
      };
      const mockPermissions = [{ user_id: userId, role: "owner" }];

      documentRepository.getDocumentPermissions.mockResolvedValue(
        mockPermissions
      );
      documentRepository.getDocumentById.mockResolvedValue(mockDocument);

      // Act
      const result = await getDocumentByIdService(userId, userRole, documentId);

      // Assert
      expect(result).toEqual(mockDocument);
      expect(documentRepository.getDocumentPermissions).toHaveBeenCalledWith(
        documentId
      );
      expect(documentRepository.getDocumentById).toHaveBeenCalledWith(
        documentId
      );
    });

    it("rejette si l'utilisateur n'a pas de permission", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const documentId = 999;
      const mockPermissions = [
        { user_id: 2, role: "owner" }, // Autre utilisateur
      ];

      documentRepository.getDocumentPermissions.mockResolvedValue(
        mockPermissions
      );

      // Act & Assert
      await expect(
        getDocumentByIdService(userId, userRole, documentId)
      ).rejects.toThrow("Accès non autorisé à ce document");
    });
  });

  describe("deleteDocumentService", () => {
    it("supprime un document avec succès", async () => {
      // Arrange
      const userId = 1;
      const userRole = "patient";
      const documentId = 1;
      const mockPermissions = [{ user_id: userId, role: "owner" }];

      documentRepository.getDocumentPermissions.mockResolvedValue(
        mockPermissions
      );
      documentRepository.deleteDocument.mockResolvedValue(true);

      // Act
      const result = await deleteDocumentService(userId, userRole, documentId);

      // Assert
      expect(result).toBe(true);
      expect(documentRepository.getDocumentPermissions).toHaveBeenCalledWith(
        documentId
      );
      expect(documentRepository.deleteDocument).toHaveBeenCalledWith(
        documentId
      );
    });
  });

  describe("shareDocumentByPatientService", () => {
    it("partage un document avec un médecin avec succès", async () => {
      // Arrange
      const documentId = 1;
      const doctorId = 2;
      const ownerId = 1;
      const duration = 30; // 30 jours
      const mockPermissions = [{ user_id: ownerId, role: "owner" }];
      const mockResult = {
        id: 1,
        document_id: documentId,
        user_id: doctorId,
        role: "shared",
      };

      documentRepository.getDocumentPermissions.mockResolvedValue(
        mockPermissions
      );
      documentRepository.createDocumentPermission.mockResolvedValue(mockResult);

      // Act
      const result = await shareDocumentByPatientService(
        documentId,
        doctorId,
        ownerId,
        duration
      );

      // Assert
      expect(result).toBeDefined();
      expect(documentRepository.getDocumentPermissions).toHaveBeenCalledWith(
        documentId
      );
      expect(documentRepository.createDocumentPermission).toHaveBeenCalledWith(
        documentId,
        doctorId,
        "shared",
        expect.any(Date)
      );
    });
  });
});
