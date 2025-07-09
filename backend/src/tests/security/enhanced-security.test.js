/**
 * Tests pour les fonctionnalités de sécurité avancées
 * - Contrôle d'accès aux données des médecins
 * - Validation des durées maximales
 */

const request = require("supertest");
const app = require("../../app");

describe("Sécurité Avancée - Contrôle d'accès médecins", () => {
  let adminToken, medecin1Token, medecin2Token, patientToken;
  let medecin1Id = 1,
    medecin2Id = 2;

  beforeAll(async () => {
    // Setup des tokens pour différents utilisateurs
    // Ces tokens devraient être générés par vos tests d'authentification
    adminToken = "admin-jwt-token";
    medecin1Token = "medecin1-jwt-token";
    medecin2Token = "medecin2-jwt-token";
    patientToken = "patient-jwt-token";
  });

  describe("POST /disponibilite - Contrôle d'accès création", () => {
    it("devrait permettre à un médecin de créer ses propres disponibilités", async () => {
      const disponibiliteData = {
        medecin_id: medecin1Id,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(201);
      expect(response.body.medecin_id).toBe(medecin1Id);
    });

    it("devrait empêcher un médecin de créer des disponibilités pour un autre médecin", async () => {
      const disponibiliteData = {
        medecin_id: medecin2Id, // Médecin 1 essaie de créer pour médecin 2
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Accès non autorisé");
    });

    it("devrait permettre à un admin de créer des disponibilités pour n'importe quel médecin", async () => {
      const disponibiliteData = {
        medecin_id: medecin2Id,
        jour: "mardi",
        heure_debut: "10:00",
        heure_fin: "18:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(disponibiliteData);

      expect(response.status).toBe(201);
      expect(response.body.medecin_id).toBe(medecin2Id);
    });

    it("devrait empêcher un patient de créer des disponibilités", async () => {
      const disponibiliteData = {
        medecin_id: medecin1Id,
        jour: "mercredi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${patientToken}`)
        .send(disponibiliteData);

      expect(response.status).toBe(403);
    });
  });

  describe("Validation des durées maximales", () => {
    it("devrait accepter une disponibilité de 8 heures (normale)", async () => {
      const disponibiliteData = {
        medecin_id: medecin1Id,
        jour: "jeudi",
        heure_debut: "08:00",
        heure_fin: "16:00", // 8 heures
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(201);
    });

    it("devrait accepter une disponibilité de 10 heures exactement (limite)", async () => {
      const disponibiliteData = {
        medecin_id: medecin1Id,
        jour: "vendredi",
        heure_debut: "08:00",
        heure_fin: "18:00", // 10 heures exactement
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(201);
    });

    it("devrait rejeter une disponibilité de plus de 10 heures", async () => {
      const disponibiliteData = {
        medecin_id: medecin1Id,
        jour: "samedi",
        heure_debut: "06:00",
        heure_fin: "20:00", // 14 heures - trop long
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("10 heures");
      expect(response.body.field).toBe("duree");
    });

    it("devrait rejeter une disponibilité de 12 heures (irréaliste)", async () => {
      const disponibiliteData = {
        medecin_id: medecin1Id,
        jour: "dimanche",
        heure_debut: "06:00",
        heure_fin: "18:00", // 12 heures
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("excéder 10 heures");
      expect(response.body.maxDuration).toBe("10 heures");
    });
  });

  describe("Logs de sécurité", () => {
    it("devrait logger les tentatives d'accès non autorisé", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const disponibiliteData = {
        medecin_id: medecin2Id,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };

      await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[SECURITY] Tentative d'accès non autorisé aux données médecin"
        )
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Validation des ID médecins", () => {
    it("devrait rejeter un ID médecin invalide (non numérique)", async () => {
      const disponibiliteData = {
        medecin_id: "invalid-id",
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("ID du médecin invalide");
    });

    it("devrait rejeter un ID médecin négatif", async () => {
      const disponibiliteData = {
        medecin_id: -1,
        jour: "lundi",
        heure_debut: "09:00",
        heure_fin: "17:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecin1Token}`)
        .send(disponibiliteData);

      expect(response.status).toBe(400);
    });
  });
});

describe("Cas d'usage métier réalistes", () => {
  let medecinToken;
  const medecinId = 1;

  beforeAll(() => {
    medecinToken = "medecin-jwt-token";
  });

  describe("Plages horaires réalistes pour médecins", () => {
    it("devrait accepter une matinée (4h)", async () => {
      const matinee = {
        medecin_id: medecinId,
        jour: "lundi",
        heure_debut: "08:00",
        heure_fin: "12:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send(matinee);

      expect(response.status).toBe(201);
    });

    it("devrait accepter un après-midi (4h)", async () => {
      const apresmidi = {
        medecin_id: medecinId,
        jour: "lundi",
        heure_debut: "14:00",
        heure_fin: "18:00",
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send(apresmidi);

      expect(response.status).toBe(201);
    });

    it("devrait accepter une journée complète (9h avec pause)", async () => {
      const journeeComplete = {
        medecin_id: medecinId,
        jour: "mardi",
        heure_debut: "08:00",
        heure_fin: "17:00", // 9h avec pause déjeuner implicite
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send(journeeComplete);

      expect(response.status).toBe(201);
    });

    it("devrait rejeter une garde de 24h (irréaliste)", async () => {
      const garde24h = {
        medecin_id: medecinId,
        jour: "mercredi",
        heure_debut: "06:00",
        heure_fin: "22:00", // 16h - impossible
      };

      const response = await request(app)
        .post("/api/disponibilite")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send(garde24h);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("10 heures");
    });
  });
});

module.exports = {
  // Exporter les fonctions de test pour réutilisation
  testUnauthorizedAccess: async (app, endpoint, token, data) => {
    return request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send(data);
  },
};
