/**
 * Tests de sécurité pour le module des disponibilités
 *
 * Ces tests valident les améliorations de sécurité implémentées :
 * - Contrôle d'accès (IDOR)
 * - Validation des entrées
 * - Rate limiting
 * - Détection d'activités suspectes
 * - Audit et logging
 */

import request from "supertest";
import app from "../../app.js";
import jwt from "jsonwebtoken";
import pool from "../../config/db.js";

describe("Sécurité - Module Disponibilités", () => {
  let medecinToken, adminToken, patientToken;
  let medecinId = 1,
    adminId = 2,
    patientId = 3;
  let disponibiliteId;

  beforeAll(async () => {
    // Générer les tokens pour les tests
    medecinToken = jwt.sign(
      { id: medecinId, email: "medecin@test.com", role: "medecin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { id: adminId, email: "admin@test.com", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    patientToken = jwt.sign(
      { id: patientId, email: "patient@test.com", role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Créer une disponibilité pour les tests
    const createResponse = await request(app)
      .post("/api/disponibilites")
      .set("Authorization", `Bearer ${medecinToken}`)
      .send({
        medecin_id: medecinId,
        jour: "lundi",
        heure_debut: "09:00:00",
        heure_fin: "17:00:00",
      });

    disponibiliteId = createResponse.body.id;
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (disponibiliteId) {
      await pool.query("DELETE FROM disponibilite_medecin WHERE id = $1", [
        disponibiliteId,
      ]);
    }
  });

  describe("1. Contrôle d'accès (IDOR Prevention)", () => {
    test("Un médecin ne peut pas voir les disponibilités d'un autre médecin", async () => {
      const response = await request(app)
        .get("/api/disponibilites/medecin/999") // ID d'un autre médecin
        .set("Authorization", `Bearer ${medecinToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Accès non autorisé");
    });

    test("Un patient ne peut pas accéder aux disponibilités", async () => {
      const response = await request(app)
        .get(`/api/disponibilites/medecin/${medecinId}`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(response.status).toBe(403);
    });

    test("Un admin peut accéder aux disponibilités de tous les médecins", async () => {
      const response = await request(app)
        .get(`/api/disponibilites/medecin/${medecinId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    test("Un médecin ne peut pas modifier la disponibilité d'un autre médecin", async () => {
      // Créer une disponibilité pour un autre médecin (via admin)
      const createResponse = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          medecin_id: 999,
          jour: "mardi",
          heure_debut: "10:00:00",
          heure_fin: "18:00:00",
        });

      const autreDispoId = createResponse.body.id;

      // Tenter de modifier avec le token du premier médecin
      const response = await request(app)
        .put(`/api/disponibilites/${autreDispoId}`)
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          jour: "mercredi",
          heure_debut: "11:00:00",
          heure_fin: "19:00:00",
        });

      expect(response.status).toBe(403);

      // Nettoyer
      await pool.query("DELETE FROM disponibilite_medecin WHERE id = $1", [
        autreDispoId,
      ]);
    });
  });

  describe("2. Validation des Entrées", () => {
    test("Rejeter un jour invalide", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: "invalidday",
          heure_debut: "09:00:00",
          heure_fin: "17:00:00",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("jour doit être");
    });

    test("Rejeter un format d'heure invalide", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: "lundi",
          heure_debut: "25:00:00", // Heure invalide
          heure_fin: "17:00:00",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("format");
    });

    test("Rejeter une durée trop courte", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: "lundi",
          heure_debut: "09:00:00",
          heure_fin: "09:15:00", // Seulement 15 minutes
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("30 minutes");
    });

    test("Rejeter des heures de travail déraisonnables", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: "lundi",
          heure_debut: "03:00:00", // Trop tôt
          heure_fin: "05:00:00",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("06:00 et 22:00");
    });

    test("Rejeter un ID de médecin invalide", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: "invalid",
          jour: "lundi",
          heure_debut: "09:00:00",
          heure_fin: "17:00:00",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("nombre entier positif");
    });

    test("Validation des créneaux - date invalide", async () => {
      const response = await request(app)
        .get(`/api/disponibilites/medecin/${medecinId}/creneaux`)
        .query({ date: "invalid-date" });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("format YYYY-MM-DD");
    });

    test("Validation des créneaux - date dans le passé", async () => {
      const response = await request(app)
        .get(`/api/disponibilites/medecin/${medecinId}/creneaux`)
        .query({ date: "2020-01-01" });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("passé");
    });
  });

  describe("3. Détection d'Activités Suspectes", () => {
    test("Détecter tentative d'injection SQL", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: "lundi; DROP TABLE disponibilite_medecin;--",
          heure_debut: "09:00:00",
          heure_fin: "17:00:00",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Requête invalide détectée");
    });

    test("Détecter tentative XSS", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: '<script>alert("xss")</script>',
          heure_debut: "09:00:00",
          heure_fin: "17:00:00",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Requête invalide détectée");
    });

    test("Détecter tentative de traversée de répertoire", async () => {
      const response = await request(app)
        .get("/api/disponibilites/medecin/../../../etc/passwd")
        .set("Authorization", `Bearer ${medecinToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Requête invalide détectée");
    });
  });

  describe("4. Rate Limiting", () => {
    test("Limiter les requêtes excessives sur les créneaux", async () => {
      const promises = [];

      // Faire 60 requêtes rapidement (limite = 50)
      for (let i = 0; i < 60; i++) {
        promises.push(
          request(app)
            .get(`/api/disponibilites/medecin/${medecinId}/creneaux`)
            .query({ date: "2024-12-31" })
        );
      }

      const responses = await Promise.all(promises);

      // Vérifier qu'au moins une requête a été limitée
      const limitedResponses = responses.filter((r) => r.status === 429);
      expect(limitedResponses.length).toBeGreaterThan(0);

      // Vérifier le message de rate limiting
      if (limitedResponses.length > 0) {
        expect(limitedResponses[0].body.message).toContain("Trop de requêtes");
        expect(limitedResponses[0].body.retryAfter).toBeDefined();
      }
    }, 30000); // Timeout plus long pour ce test
  });

  describe("5. Sanitisation des Entrées", () => {
    test("Nettoyer les caractères dangereux", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: "lundi<>",
          heure_debut: "09:00:00",
          heure_fin: "17:00:00",
        });

      // La sanitisation devrait nettoyer les caractères, mais la validation rejettera toujours
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("jour doit être");
    });
  });

  describe("6. Gestion des Erreurs", () => {
    test("Erreur 404 pour ressource inexistante", async () => {
      const response = await request(app)
        .put("/api/disponibilites/99999")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          jour: "lundi",
          heure_debut: "09:00:00",
          heure_fin: "17:00:00",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("non trouvée");
    });

    test("Erreur 401 sans authentification", async () => {
      const response = await request(app).post("/api/disponibilites").send({
        medecin_id: medecinId,
        jour: "lundi",
        heure_debut: "09:00:00",
        heure_fin: "17:00:00",
      });

      expect(response.status).toBe(401);
    });

    test("Erreur 401 avec token invalide", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", "Bearer invalid-token")
        .send({
          medecin_id: medecinId,
          jour: "lundi",
          heure_debut: "09:00:00",
          heure_fin: "17:00:00",
        });

      expect(response.status).toBe(401);
    });
  });

  describe("7. Cas d'Usage Légitimes", () => {
    test("Création valide d'une disponibilité", async () => {
      const response = await request(app)
        .post("/api/disponibilites")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          medecin_id: medecinId,
          jour: "mardi",
          heure_debut: "10:00:00",
          heure_fin: "18:00:00",
        });

      expect(response.status).toBe(201);
      expect(response.body.jour).toBe("mardi");
      expect(response.body.medecin_id).toBe(medecinId);

      // Nettoyer
      await pool.query("DELETE FROM disponibilite_medecin WHERE id = $1", [
        response.body.id,
      ]);
    });

    test("Modification valide d'une disponibilité", async () => {
      const response = await request(app)
        .put(`/api/disponibilites/${disponibiliteId}`)
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          jour: "mercredi",
          heure_debut: "08:00:00",
          heure_fin: "16:00:00",
        });

      expect(response.status).toBe(200);
      expect(response.body.jour).toBe("mercredi");
    });

    test("Consultation valide des créneaux", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const response = await request(app)
        .get(`/api/disponibilites/medecin/${medecinId}/creneaux`)
        .query({ date: dateStr });

      expect(response.status).toBe(200);
      expect(response.body.date).toBe(dateStr);
      expect(response.body.creneaux).toBeDefined();
    });
  });
});

/**
 * Tests de performance et de sécurité avancés
 */
describe("Tests de Performance et Sécurité Avancés", () => {
  test("Temps de réponse consistent (protection timing attacks)", async () => {
    const times = [];

    // Tester avec des IDs existants et inexistants
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await request(app)
        .get(`/api/disponibilites/medecin/${i % 2 === 0 ? 1 : 99999}`)
        .set("Authorization", `Bearer ${medecinToken}`);
      const end = Date.now();
      times.push(end - start);
    }

    // Vérifier que les temps sont relativement constants
    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const maxDeviation = Math.max(...times.map((t) => Math.abs(t - avgTime)));

    // La déviation ne devrait pas être trop importante (protection timing)
    expect(maxDeviation).toBeLessThan(avgTime * 0.5);
  });

  test("Résistance aux attaques par force brute", async () => {
    const promises = [];

    // Tenter plusieurs accès non autorisés
    for (let i = 0; i < 20; i++) {
      promises.push(
        request(app)
          .get(`/api/disponibilites/medecin/${i + 1000}`)
          .set("Authorization", `Bearer ${medecinToken}`)
      );
    }

    const responses = await Promise.all(promises);

    // Toutes les réponses devraient être 403
    responses.forEach((response) => {
      expect(response.status).toBe(403);
    });
  });
});

/**
 * Tests d'intégration avec les logs
 */
describe("Tests de Logging et Audit", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Logs d'audit pour création de disponibilité", async () => {
    await request(app)
      .post("/api/disponibilites")
      .set("Authorization", `Bearer ${medecinToken}`)
      .send({
        medecin_id: medecinId,
        jour: "jeudi",
        heure_debut: "09:00:00",
        heure_fin: "17:00:00",
      });

    // Vérifier que les logs d'audit sont générés
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[AUDIT] Disponibilité créée")
    );
  });

  test("Logs de sécurité pour tentative d'accès non autorisé", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await request(app)
      .get("/api/disponibilites/medecin/999")
      .set("Authorization", `Bearer ${medecinToken}`);

    // Vérifier que les logs de sécurité sont générés
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[SECURITY] 403 Forbidden")
    );

    warnSpy.mockRestore();
  });
});
