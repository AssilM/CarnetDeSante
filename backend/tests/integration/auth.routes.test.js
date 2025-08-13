import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { initTables, dropAllTables } from "../../src/data/createTables.js";
import pool from "../../src/config/db.js";

// Mock des services externes pour éviter les envois d'emails en test
vi.mock("../../src/email/index.js", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendOTPEmail: vi.fn().mockResolvedValue(true),
  verifyAndConsumeToken: vi.fn().mockResolvedValue(true),
}));

describe("Auth Routes Integration", () => {
  beforeAll(async () => {
    // Initialiser la base de données de test
    await dropAllTables();
    await initTables();
  });

  afterAll(async () => {
    // Nettoyer et fermer les connexions
    await dropAllTables();
    await pool.end();
  });

  beforeEach(async () => {
    // Nettoyer les données entre chaque test
    await pool.query("DELETE FROM refresh_token");
    await pool.query("DELETE FROM user_tokens");
    await pool.query("DELETE FROM document_permission");
    await pool.query("DELETE FROM patient_doctor");
    await pool.query("DELETE FROM patient");
    await pool.query("DELETE FROM medecin");
    await pool.query("DELETE FROM administrateur");
    await pool.query("DELETE FROM utilisateur");
  });

  describe("POST /api/auth/signup", () => {
    it("crée un patient avec succès", async () => {
      const userData = {
        email: "patient@test.com",
        password: "MotDePasse123!",
        nom: "Dupont",
        prenom: "Jean",
        date_naissance: "1990-05-15",
        tel_indicatif: "+33",
        tel_numero: "0123456789",
        sexe: "M",
        adresse: "123 Rue de la Paix",
        code_postal: "75001",
        ville: "Paris",
        patient_data: {
          groupe_sanguin: "O+",
          poids: 75,
        },
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: expect.stringContaining("Compte créé"),
        user: {
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          role: "patient",
          email_verified: false,
        },
      });

      // Vérifier en base
      const userInDb = await pool.query(
        "SELECT * FROM utilisateur WHERE email = $1",
        [userData.email]
      );
      expect(userInDb.rows).toHaveLength(1);
      expect(userInDb.rows[0].role).toBe("patient");

      // Vérifier que le profil patient a été créé
      const patientInDb = await pool.query(
        "SELECT * FROM patient WHERE utilisateur_id = $1",
        [userInDb.rows[0].id]
      );
      expect(patientInDb.rows).toHaveLength(1);
      expect(patientInDb.rows[0].groupe_sanguin).toBe("O+");
    });

    it("rejette un utilisateur trop jeune", async () => {
      const userData = {
        email: "trop.jeune@test.com",
        password: "MotDePasse123!",
        nom: "Jeune",
        prenom: "Trop",
        date_naissance: "2015-01-01", // Moins de 13 ans
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain("13 ans");
    });

    it("rejette un email déjà utilisé", async () => {
      const userData = {
        email: "double@test.com",
        password: "MotDePasse123!",
        nom: "Test",
        prenom: "User",
      };

      // Première inscription
      await request(app).post("/api/auth/signup").send(userData).expect(201);

      // Deuxième inscription avec même email
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain("déjà utilisé");
    });

    it("valide les champs requis", async () => {
      const invalidData = {
        // email manquant
        password: "MotDePasse123!",
        nom: "Test",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/signup/medecin", () => {
    it("crée un médecin avec succès", async () => {
      const medecinData = {
        email: "medecin@test.com",
        password: "MotDePasse123!",
        nom: "Martin",
        prenom: "Pierre",
        medecin_data: {
          specialite: "Cardiologie",
          description: "Spécialiste en cardiologie",
        },
      };

      const response = await request(app)
        .post("/api/auth/signup/medecin")
        .send(medecinData)
        .expect(201);

      expect(response.body.user.role).toBe("medecin");

      // Vérifier le profil médecin
      const userInDb = await pool.query(
        "SELECT * FROM utilisateur WHERE email = $1",
        [medecinData.email]
      );
      const medecinInDb = await pool.query(
        "SELECT * FROM medecin WHERE utilisateur_id = $1",
        [userInDb.rows[0].id]
      );

      expect(medecinInDb.rows).toHaveLength(1);
      expect(medecinInDb.rows[0].specialite).toBe("Cardiologie");
    });
  });

  describe("POST /api/auth/signin", () => {
    let testUser;

    beforeEach(async () => {
      // Créer un utilisateur vérifié pour les tests de connexion
      const signupResponse = await request(app).post("/api/auth/signup").send({
        email: "signin@test.com",
        password: "MotDePasse123!",
        nom: "Test",
        prenom: "User",
      });

      testUser = signupResponse.body.user;

      // Marquer l'email comme vérifié
      await pool.query(
        "UPDATE utilisateur SET email_verified = true WHERE id = $1",
        [testUser.id]
      );
    });

    it("connecte un utilisateur avec des identifiants valides", async () => {
      const response = await request(app)
        .post("/api/auth/signin")
        .send({
          email: "signin@test.com",
          password: "MotDePasse123!",
        })
        .expect(200);

      // L'API renvoie le token et l'utilisateur
      expect(response.body).toMatchObject({
        token: expect.any(String),
        user: {
          email: "signin@test.com",
          nom: "Test",
          prenom: "User",
          role: "patient",
        },
      });

      // Vérifier que le cookie refresh token est présent
      expect(response.headers["set-cookie"]).toBeDefined();

      // Vérifier que le refresh token a été stocké
      const refreshTokens = await pool.query(
        "SELECT * FROM refresh_token WHERE utilisateur_id = $1",
        [testUser.id]
      );
      expect(refreshTokens.rows).toHaveLength(1);
    });

    it("rejette des identifiants incorrects", async () => {
      const response = await request(app)
        .post("/api/auth/signin")
        .send({
          email: "signin@test.com",
          password: "MauvaisMotDePasse!",
        })
        .expect(401);

      expect(response.body.message).toContain("incorrect");
    });

    it("rejette un utilisateur avec email non vérifié", async () => {
      // Créer un utilisateur non vérifié
      await request(app).post("/api/auth/signup").send({
        email: "non.verifie@test.com",
        password: "MotDePasse123!",
        nom: "Non",
        prenom: "Verifie",
      });

      const response = await request(app)
        .post("/api/auth/signin")
        .send({
          email: "non.verifie@test.com",
          password: "MotDePasse123!",
        })
        .expect(403);

      expect(response.body.message).toContain("vérifier");
    });

    it("rejette un email inexistant", async () => {
      const response = await request(app)
        .post("/api/auth/signin")
        .send({
          email: "inexistant@test.com",
          password: "MotDePasse123!",
        })
        .expect(401);

      expect(response.body.message).toContain("incorrect");
    });
  });

  describe("GET /api/auth/me", () => {
    let accessToken;

    beforeEach(async () => {
      // Créer et connecter un utilisateur
      await request(app).post("/api/auth/signup").send({
        email: "me@test.com",
        password: "MotDePasse123!",
        nom: "Me",
        prenom: "Test",
      });

      await pool.query(
        "UPDATE utilisateur SET email_verified = true WHERE email = $1",
        ["me@test.com"]
      );

      const signinResponse = await request(app).post("/api/auth/signin").send({
        email: "me@test.com",
        password: "MotDePasse123!",
      });

      // Récupérer le token d'accès
      accessToken = signinResponse.body.token;
    });

    it("retourne les informations de l'utilisateur connecté", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user).toMatchObject({
        email: "me@test.com",
        nom: "Me",
        prenom: "Test",
        role: "patient",
      });
    });

    it("rejette les requêtes sans token", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body.message).toContain("authentification requis");
    });

    it("rejette les tokens invalides", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(response.body.message).toContain("invalide");
    });
  });

  describe("POST /api/auth/signout", () => {
    let accessToken, userId;

    beforeEach(async () => {
      const signupResponse = await request(app).post("/api/auth/signup").send({
        email: "signout@test.com",
        password: "MotDePasse123!",
        nom: "Signout",
        prenom: "Test",
      });

      userId = signupResponse.body.user.id;
      await pool.query(
        "UPDATE utilisateur SET email_verified = true WHERE id = $1",
        [userId]
      );

      const signinResponse = await request(app).post("/api/auth/signin").send({
        email: "signout@test.com",
        password: "MotDePasse123!",
      });

      accessToken = signinResponse.body.token;
    });

    it("déconnecte l'utilisateur et invalide les tokens", async () => {
      // Vérifier qu'il y a des refresh tokens avant
      const tokensBefore = await pool.query(
        "SELECT * FROM refresh_token WHERE utilisateur_id = $1",
        [userId]
      );
      expect(tokensBefore.rows.length).toBeGreaterThan(0);

      const response = await request(app)
        .post("/api/auth/signout?all=true")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toContain("Déconnexion réussie");

      // Vérifier que tous les refresh tokens ont été supprimés (allDevices=true)
      const tokensAfter = await pool.query(
        "SELECT * FROM refresh_token WHERE utilisateur_id = $1",
        [userId]
      );
      expect(tokensAfter.rows).toHaveLength(0);
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    let refreshToken;

    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send({
        email: "refresh@test.com",
        password: "MotDePasse123!",
        nom: "Refresh",
        prenom: "Test",
      });

      await pool.query(
        "UPDATE utilisateur SET email_verified = true WHERE email = $1",
        ["refresh@test.com"]
      );

      const signinResponse = await request(app).post("/api/auth/signin").send({
        email: "refresh@test.com",
        password: "MotDePasse123!",
      });

      // Récupérer les cookies (qui contiennent le refresh token)
      refreshToken = signinResponse.headers["set-cookie"];
    });

    it("génère un nouveau access token avec un refresh token valide", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .set("Cookie", refreshToken)
        .expect(200);

      expect(response.body).toMatchObject({
        message: "Token rafraîchi avec succès",
        token: expect.any(String),
      });

      // Vérifier qu'un nouveau cookie refresh token est envoyé
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("rejette un refresh token invalide", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .set("Cookie", ["jid=invalid_token"])
        .expect(401);

      expect(response.body.message).toContain("Token invalide");
    });
  });
});
