import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock du module db.js avant les imports
vi.mock("../../src/config/db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

import {
  authenticate,
  authorize,
} from "../../src/middlewares/auth.middleware.js";
import pool from "../../src/config/db.js";

// Mock des variables d'environnement
vi.stubEnv("JWT_SECRET", "test_secret_jwt_very_long_for_testing");

// Helper pour créer des objets req/res/next mockés
const createMockObjects = () => {
  const req = {
    headers: {},
    userId: undefined,
    userEmail: undefined,
    userRole: undefined,
  };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  const next = vi.fn();

  return { req, res, next };
};

// Helper pour générer un token JWT valide
const generateValidToken = async (
  payload = { id: 1, email: "test@example.com", role: "patient" }
) => {
  const jwt = await import("jsonwebtoken");
  return jwt.default.sign(payload, "test_secret_jwt_very_long_for_testing", {
    expiresIn: "15m",
  });
};

describe("auth.middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("authenticate", () => {
    it("rejette les requêtes sans header Authorization", async () => {
      const { req, res, next } = createMockObjects();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token d'authentification requis",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("rejette les headers Authorization mal formatés", async () => {
      const { req, res, next } = createMockObjects();

      // Tester différents formats invalides
      const invalidHeadersNoToken = [
        "InvalidToken",
        "Basic sometoken",
        "Bearer",
      ];

      const invalidHeadersEmptyToken = ["Bearer "];

      // Tests pour headers sans Bearer token valide
      for (const authHeader of invalidHeadersNoToken) {
        vi.clearAllMocks();
        req.headers.authorization = authHeader;

        await authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          message: "Token d'authentification requis",
        });
        expect(next).not.toHaveBeenCalled();
      }

      // Tests pour Bearer avec token vide (traité comme invalide)
      for (const authHeader of invalidHeadersEmptyToken) {
        vi.clearAllMocks();
        req.headers.authorization = authHeader;

        await authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          message: "Token invalide ou expiré",
        });
        expect(next).not.toHaveBeenCalled();
      }
    });

    it("rejette les tokens JWT invalides", async () => {
      const { req, res, next } = createMockObjects();
      req.headers.authorization = "Bearer invalid_jwt_token";

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token invalide ou expiré",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("rejette les tokens sans informations complètes", async () => {
      const { req, res, next } = createMockObjects();

      // Token sans role
      const incompleteToken = await generateValidToken({
        id: 1,
        email: "test@example.com",
      });
      req.headers.authorization = `Bearer ${incompleteToken}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token invalide (informations manquantes)",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("rejette si l'utilisateur n'existe plus en base", async () => {
      const { req, res, next } = createMockObjects();

      // Mock : utilisateur non trouvé en base
      pool.query.mockResolvedValueOnce({ rows: [] });

      const validToken = await generateValidToken();
      req.headers.authorization = `Bearer ${validToken}`;

      await authenticate(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT id, email, role FROM utilisateur WHERE id = $1",
        [1]
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("authentifie avec succès un token valide", async () => {
      const { req, res, next } = createMockObjects();

      // Mock : utilisateur trouvé en base
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: "test@example.com", role: "patient" }],
      });

      const validToken = await generateValidToken();
      req.headers.authorization = `Bearer ${validToken}`;

      await authenticate(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT id, email, role FROM utilisateur WHERE id = $1",
        [1]
      );
      expect(req.userId).toBe(1);
      expect(req.userEmail).toBe("test@example.com");
      expect(req.userRole).toBe("patient");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("gère les erreurs de base de données", async () => {
      const { req, res, next } = createMockObjects();

      // Mock : erreur DB
      pool.query.mockRejectedValueOnce(new Error("Database connection failed"));

      const validToken = await generateValidToken();
      req.headers.authorization = `Bearer ${validToken}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur serveur lors de la vérification de l'authentification",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("authorize", () => {
    it("rejette si authenticate n'a pas été appelé avant", () => {
      const { req, res, next } = createMockObjects();
      const authorizeMiddleware = authorize(["patient"]);

      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "Erreur de configuration des middlewares: authenticate doit être appelé avant authorize",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("autorise un rôle correspondant (string)", () => {
      const { req, res, next } = createMockObjects();

      // Simuler qu'authenticate a été appelé
      req.userId = 1;
      req.userRole = "patient";

      const authorizeMiddleware = authorize("patient");
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("autorise un rôle correspondant (array)", () => {
      const { req, res, next } = createMockObjects();

      req.userId = 1;
      req.userRole = "medecin";

      const authorizeMiddleware = authorize(["patient", "medecin"]);
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("rejette un rôle non autorisé", () => {
      const { req, res, next } = createMockObjects();

      req.userId = 1;
      req.userRole = "patient";

      const authorizeMiddleware = authorize(["medecin", "admin"]);
      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Accès non autorisé",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("gère différents rôles correctement", () => {
      const testCases = [
        { userRole: "admin", allowedRoles: ["admin"], shouldPass: true },
        { userRole: "medecin", allowedRoles: ["patient"], shouldPass: false },
        {
          userRole: "patient",
          allowedRoles: ["patient", "medecin"],
          shouldPass: true,
        },
        { userRole: "admin", allowedRoles: "admin", shouldPass: true },
        { userRole: "patient", allowedRoles: "medecin", shouldPass: false },
      ];

      testCases.forEach(({ userRole, allowedRoles, shouldPass }, index) => {
        const { req, res, next } = createMockObjects();

        req.userId = 1;
        req.userRole = userRole;

        const authorizeMiddleware = authorize(allowedRoles);
        authorizeMiddleware(req, res, next);

        if (shouldPass) {
          expect(next).toHaveBeenCalled();
          expect(res.status).not.toHaveBeenCalled();
        } else {
          expect(res.status).toHaveBeenCalledWith(403);
          expect(next).not.toHaveBeenCalled();
        }

        vi.clearAllMocks();
      });
    });
  });

  describe("intégration authenticate + authorize", () => {
    it("chaîne authenticate puis authorize avec succès", async () => {
      const { req, res, next } = createMockObjects();

      // Mock DB success
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: "test@example.com", role: "medecin" }],
      });

      const validToken = await generateValidToken({
        id: 1,
        email: "test@example.com",
        role: "medecin",
      });
      req.headers.authorization = `Bearer ${validToken}`;

      // Première étape : authenticate
      await authenticate(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.userRole).toBe("medecin");

      // Deuxième étape : authorize
      vi.clearAllMocks();
      const authorizeMiddleware = authorize(["medecin", "admin"]);
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
