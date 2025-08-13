import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock des modules d'abord
vi.mock("../../src/config/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock("../../src/appointment/rendezvous.repository.js", () => ({
  findAllRendezVous: vi.fn(),
  findRendezVousById: vi.fn(),
  findRendezVousByPatientId: vi.fn(),
  findRendezVousByMedecinId: vi.fn(),
  createRendezVous: vi.fn(),
  updateRendezVous: vi.fn(),
  cancelRendezVous: vi.fn(),
  deleteRendezVous: vi.fn(),
  checkRendezVousConflict: vi.fn(),
  updateNotesMedecin: vi.fn(),
  updateRaisonAnnulation: vi.fn(),
  createFollowRelationship: vi.fn(),
}));

vi.mock("../../src/utils/date.utils.js", () => ({
  getJourSemaine: vi.fn(),
  isDateInFuture: vi.fn(),
}));

// Importer le service après les mocks
import {
  getAllRendezVousService,
  getRendezVousByIdService,
  createRendezVousService,
  cancelRendezVousService,
  checkDoctorAvailabilityService,
  updateNotesMedecinService,
} from "../../src/appointment/rendezvous.service.js";

import pool from "../../src/config/db.js";
import {
  findAllRendezVous,
  findRendezVousById,
  createRendezVous,
  cancelRendezVous,
  createFollowRelationship,
  updateNotesMedecin,
} from "../../src/appointment/rendezvous.repository.js";
import { isDateInFuture } from "../../src/utils/date.utils.js";

describe("rendezvous.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllRendezVousService", () => {
    it("récupère tous les rendez-vous", async () => {
      // Arrange
      const mockRendezVous = [
        { id: 1, patient_nom: "Dupont", medecin_nom: "Dr Martin" },
        { id: 2, patient_nom: "Durand", medecin_nom: "Dr Lefebvre" },
      ];
      findAllRendezVous.mockResolvedValue(mockRendezVous);

      // Act
      const result = await getAllRendezVousService();

      // Assert
      expect(result).toEqual(mockRendezVous);
      expect(findAllRendezVous).toHaveBeenCalledOnce();
    });
  });

  describe("getRendezVousByIdService", () => {
    it("récupère un rendez-vous pour un admin", async () => {
      // Arrange
      const rdvId = 1;
      const requesterId = 999;
      const requesterRole = "admin";
      const mockRdv = {
        id: rdvId,
        patient_id: 1,
        medecin_id: 2,
        date: "2024-12-25",
      };

      findRendezVousById.mockResolvedValue(mockRdv);

      // Act
      const result = await getRendezVousByIdService(
        rdvId,
        requesterId,
        requesterRole
      );

      // Assert
      expect(result).toEqual(mockRdv);
      expect(findRendezVousById).toHaveBeenCalledWith(rdvId);
    });

    it("récupère un rendez-vous pour le patient concerné", async () => {
      // Arrange
      const rdvId = 1;
      const requesterId = 1; // Même ID que patient_id
      const requesterRole = "patient";
      const mockRdv = {
        id: rdvId,
        patient_id: 1,
        medecin_id: 2,
        date: "2024-12-25",
      };

      findRendezVousById.mockResolvedValue(mockRdv);

      // Act
      const result = await getRendezVousByIdService(
        rdvId,
        requesterId,
        requesterRole
      );

      // Assert
      expect(result).toEqual(mockRdv);
    });

    it("rejette l'accès pour un patient non autorisé", async () => {
      // Arrange
      const rdvId = 1;
      const requesterId = 999; // ID différent du patient_id
      const requesterRole = "patient";
      const mockRdv = {
        id: rdvId,
        patient_id: 1,
        medecin_id: 2,
        date: "2024-12-25",
      };

      findRendezVousById.mockResolvedValue(mockRdv);

      // Act & Assert
      await expect(
        getRendezVousByIdService(rdvId, requesterId, requesterRole)
      ).rejects.toThrow("Accès non autorisé");
    });

    it("retourne null si le rendez-vous n'existe pas", async () => {
      // Arrange
      findRendezVousById.mockResolvedValue(null);

      // Act
      const result = await getRendezVousByIdService(999, 1, "admin");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("createRendezVousService", () => {
    it("crée un rendez-vous avec succès", async () => {
      // Arrange
      const rdvData = {
        patient_id: 1,
        medecin_id: 2,
        date: "2024-12-25",
        heure: "14:00",
        duree: 30,
        motif: "Consultation",
        adresse: "Cabinet médical",
      };
      const mockCreatedRdv = { id: 1, ...rdvData };
      const mockCompleteRdv = { ...mockCreatedRdv, patient_nom: "Dupont" };

      isDateInFuture.mockReturnValue(true);
      createRendezVous.mockResolvedValue(mockCreatedRdv);
      findRendezVousById.mockResolvedValue(mockCompleteRdv);
      createFollowRelationship.mockResolvedValue(true);

      // Act
      const result = await createRendezVousService(rdvData);

      // Assert
      expect(result).toEqual(mockCompleteRdv);
      expect(isDateInFuture).toHaveBeenCalledWith(rdvData.date);
      expect(createRendezVous).toHaveBeenCalledWith(
        rdvData.patient_id,
        rdvData.medecin_id,
        rdvData.date,
        rdvData.heure,
        rdvData.duree,
        rdvData.motif,
        rdvData.adresse
      );
      expect(createFollowRelationship).toHaveBeenCalledWith(
        rdvData.patient_id,
        rdvData.medecin_id
      );
    });

    it("utilise la durée par défaut de 30 minutes", async () => {
      // Arrange
      const rdvData = {
        patient_id: 1,
        medecin_id: 2,
        date: "2024-12-25",
        heure: "14:00",
        // duree non spécifiée
        motif: "Consultation",
      };
      const mockCreatedRdv = { id: 1, ...rdvData, duree: 30 };

      isDateInFuture.mockReturnValue(true);
      createRendezVous.mockResolvedValue(mockCreatedRdv);
      findRendezVousById.mockResolvedValue(mockCreatedRdv);
      createFollowRelationship.mockResolvedValue(true);

      // Act
      await createRendezVousService(rdvData);

      // Assert
      expect(createRendezVous).toHaveBeenCalledWith(
        rdvData.patient_id,
        rdvData.medecin_id,
        rdvData.date,
        rdvData.heure,
        30, // Durée par défaut
        rdvData.motif,
        null // adresse non spécifiée
      );
    });

    it("rejette un rendez-vous dans le passé", async () => {
      // Arrange
      const rdvData = {
        patient_id: 1,
        medecin_id: 2,
        date: "2020-01-01", // Date passée
        heure: "14:00",
      };

      isDateInFuture.mockReturnValue(false);

      // Act & Assert
      await expect(createRendezVousService(rdvData)).rejects.toThrow(
        "Impossible de prendre un rendez-vous pour aujourd'hui ou une date passée."
      );
    });

    it("continue même si la création du lien patient-médecin échoue", async () => {
      // Arrange
      const rdvData = {
        patient_id: 1,
        medecin_id: 2,
        date: "2024-12-25",
        heure: "14:00",
      };
      const mockCreatedRdv = { id: 1, ...rdvData };

      isDateInFuture.mockReturnValue(true);
      createRendezVous.mockResolvedValue(mockCreatedRdv);
      findRendezVousById.mockResolvedValue(mockCreatedRdv);
      createFollowRelationship.mockRejectedValue(
        new Error("Lien déjà existant")
      );

      // Act
      const result = await createRendezVousService(rdvData);

      // Assert
      expect(result).toEqual(mockCreatedRdv);
      // Le rendez-vous est créé malgré l'erreur du lien
    });
  });

  describe("cancelRendezVousService", () => {
    it("annule un rendez-vous avec succès", async () => {
      // Arrange
      const rdvId = 1;
      const mockCancelledRdv = { id: rdvId, statut: "annule" };

      cancelRendezVous.mockResolvedValue(mockCancelledRdv);

      // Act
      const result = await cancelRendezVousService(rdvId);

      // Assert
      expect(result).toEqual(mockCancelledRdv);
      expect(cancelRendezVous).toHaveBeenCalledWith(rdvId);
    });
  });

  describe("checkDoctorAvailabilityService", () => {
    it("vérifie la disponibilité d'un médecin", async () => {
      // Arrange
      const medecinId = 1;
      const dateStr = "2024-12-25";
      const heure = "14:00";

      // Mock pour le jour de la semaine
      pool.query.mockResolvedValueOnce({
        rows: [{ jour_num: 3 }], // Mercredi
      });

      // Mock pour la disponibilité
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            heure_debut: "09:00",
            heure_fin: "17:00",
          },
        ],
      });

      // Mock pour les rendez-vous existants
      pool.query.mockResolvedValueOnce({
        rows: [], // Aucun conflit
      });

      // Act
      const result = await checkDoctorAvailabilityService(
        medecinId,
        dateStr,
        heure
      );

      // Assert
      expect(result).toEqual({ available: true, jour: "mercredi" });
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it("rejette si les données sont incomplètes", async () => {
      // Act & Assert
      await expect(
        checkDoctorAvailabilityService(null, "2024-12-25", "14:00")
      ).rejects.toThrow("Erreur lors de la vérification de la disponibilité");
    });
  });

  describe("updateNotesMedecinService", () => {
    it("met à jour les notes du médecin", async () => {
      // Arrange
      const appointmentId = 1;
      const medecinId = 2;
      const notes = "Patient en bonne santé";
      const mockRdv = { id: appointmentId, medecin_id: medecinId };
      const mockUpdatedRdv = { id: appointmentId, notes_medecin: notes };

      findRendezVousById.mockResolvedValue(mockRdv);
      updateNotesMedecin.mockResolvedValue(mockUpdatedRdv);

      // Act
      const result = await updateNotesMedecinService(
        appointmentId,
        medecinId,
        notes
      );

      // Assert
      expect(result).toEqual(mockUpdatedRdv);
      expect(findRendezVousById).toHaveBeenCalledWith(appointmentId);
      expect(updateNotesMedecin).toHaveBeenCalledWith(
        appointmentId,
        medecinId,
        notes
      );
    });
  });
});
